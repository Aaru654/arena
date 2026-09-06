import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

interface RouteContext { params: { id: string } }

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  if (!body.email || !body.password || String(body.password).length < 8) return NextResponse.json({ message: 'Email and password of at least 8 characters are required' }, { status: 400 });
  const service = await createServiceClient();
  const { data: authData, error: authError } = await service.auth.admin.createUser({ email: String(body.email), password: String(body.password), email_confirm: true });
  if (authError || !authData.user) return NextResponse.json({ message: authError?.message || 'Unable to create user' }, { status: 500 });
  const { data, error } = await (service.from('profiles') as any).insert({ id: authData.user.id, tenant_id: params.id, email: String(body.email), full_name: body.full_name ? String(body.full_name) : null, role: body.role === 'viewer' ? 'viewer' : 'tenant_admin', is_active: true }).select().single();
  if (error) { await service.auth.admin.deleteUser(authData.user.id); return NextResponse.json({ message: error.message }, { status: 500 }); }
  return NextResponse.json({ profile: data }, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const service = await createServiceClient();
  const { data, error } = await (service.from('profiles') as any).update({ is_active: Boolean(body.is_active) }).eq('id', body.id).eq('tenant_id', params.id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
