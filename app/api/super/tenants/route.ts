import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

function tenantPayload(body: Record<string, unknown>) {
  const name = String(body.name || '').trim();
  const subdomain = String(body.subdomain || '').trim();
  if (name.length < 2) throw new Error('Business name required');
  if (!/^[a-z0-9-]{2,30}$/.test(subdomain) || subdomain.startsWith('-') || subdomain.endsWith('-')) throw new Error('Invalid subdomain');
  const plan = ['starter', 'pro', 'enterprise'].includes(String(body.plan)) ? String(body.plan) : 'starter';
  const propertyLimit = Number(body.property_limit || 25);
  if (!Number.isInteger(propertyLimit) || propertyLimit < 1) throw new Error('Property limit must be a positive integer');
  return { name, subdomain, branding: { logo_url: body.logo_url ? String(body.logo_url) : null, primary_color: body.primary_color || '#22c55e' }, settings: { whatsapp_number: body.whatsapp_number || '', contact_email: body.contact_email || '', plan, property_limit: propertyLimit, expires_at: body.expires_at || null } };
}

export async function GET() {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const { data, error } = await (service.from('tenants') as any).select('*, properties(id), profiles(id)').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ tenants: (data || []).map((tenant: any) => ({ ...tenant, property_count: tenant.properties?.length || 0, user_count: tenant.profiles?.length || 0 })) });
}

export async function POST(request: NextRequest) {
  const context = await getSuperAdminContext();
  if (!context) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  let tenantId: string | null = null;
  let authUserId: string | null = null;
  try {
    const body = await request.json();
    const payload = tenantPayload(body);
    const { data: existing } = await (service.from('tenants') as any).select('id').eq('subdomain', payload.subdomain).maybeSingle();
    if (existing) return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 });
    const { data: tenant, error: tenantError } = await (service.from('tenants') as any).insert({ ...payload, is_active: true }).select().single();
    if (tenantError) throw tenantError;
    tenantId = tenant.id;
    console.info('[super] tenant created', tenantId);

    if (!body.admin_email || !body.admin_password) throw new Error('Admin email and password are required');
    const { data: authData, error: authError } = await service.auth.admin.createUser({ email: String(body.admin_email), password: String(body.admin_password), email_confirm: true });
    if (authError || !authData.user) throw authError || new Error('Unable to create admin account');
    authUserId = authData.user.id;
    console.info('[super] auth user created', authUserId);

    const { error: profileError } = await (service.from('profiles') as any).insert({ id: authUserId, tenant_id: tenantId, email: String(body.admin_email), full_name: body.admin_full_name ? String(body.admin_full_name) : null, role: 'tenant_admin', is_active: true });
    if (profileError) throw profileError;
    console.info('[super] tenant profile created', tenantId);
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    console.error('[super] tenant creation failed, rolling back', error);
    if (authUserId) await service.auth.admin.deleteUser(authUserId);
    if (tenantId) await (service.from('tenants') as any).delete().eq('id', tenantId);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create tenant' }, { status: 500 });
  }
}
