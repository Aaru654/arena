import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get('subdomain')?.trim().toLowerCase() || '';
  if (!/^[a-z0-9-]{2,30}$/.test(subdomain) || subdomain.startsWith('-') || subdomain.endsWith('-')) return NextResponse.json({ available: false });
  const supabase = await createClient();
  const { data, error } = await (supabase.from('tenants') as any).select('id').eq('subdomain', subdomain).maybeSingle();
  return NextResponse.json({ available: !error && !data });
}
