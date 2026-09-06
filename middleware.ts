import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fix tenant slug extraction for localhost
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  let tenantSlug = '';
  if (isLocalhost) {
    // In local dev: read from x-tenant-slug header or use 'dev' fallback
    tenantSlug = request.headers.get('x-tenant-slug') || 'dev';
  } else {
    // Production: extract subdomain
    tenantSlug = host.split('.')[0];
  }

  // Inject into request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const excludedPaths = [
    '/api/webhook',
    '/p/',
    '/c/',
    '/_next',
    '/favicon.ico',
    '/api/health',
  ];

  const isExcluded = excludedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isExcluded) {
    return supabaseResponse;
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const profile = await getProfileFromRequest(request);
    if (!profile || (profile.role !== 'tenant_admin' && profile.role !== 'super_admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/super-admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const profile = await getProfileFromRequest(request);
    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

async function getProfileFromRequest(request: NextRequest) {
  try {
    const { createClient } = await import('@/app/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    return result.data as any;
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
