import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

interface RouteContext { params: { id: string } }

async function getTenant(service: any, id: string) {
  return service.from('tenants').select('*').eq('id', id).maybeSingle();
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  try {
    const { data: current, error: currentError } = await getTenant(service, params.id);
    if (currentError) throw currentError;
    if (!current) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name ?? current.name).trim();
    const subdomain = String(body.subdomain ?? current.subdomain).trim();
    if (name.length < 2 || !/^[a-z0-9-]{2,30}$/.test(subdomain) || subdomain.startsWith('-') || subdomain.endsWith('-')) return NextResponse.json({ message: 'Invalid tenant details' }, { status: 400 });
    if (subdomain !== current.subdomain) {
      const { data: duplicate } = await (service.from('tenants') as any).select('id').eq('subdomain', subdomain).neq('id', params.id).maybeSingle();
      if (duplicate) return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 });
    }
    const branding = { ...(current.branding || {}), ...(body.primary_color !== undefined ? { primary_color: body.primary_color } : {}), ...(body.logo_url !== undefined ? { logo_url: body.logo_url || null } : {}) };
    const settings = { ...(current.settings || {}), ...(body.plan !== undefined ? { plan: body.plan } : {}), ...(body.property_limit !== undefined ? { property_limit: Number(body.property_limit) } : {}), ...(body.whatsapp_number !== undefined ? { whatsapp_number: body.whatsapp_number } : {}), ...(body.contact_email !== undefined ? { contact_email: body.contact_email } : {}), ...(body.expires_at !== undefined ? { expires_at: body.expires_at || null } : {}) };
    const { data: tenant, error } = await (service.from('tenants') as any).update({ name, subdomain, branding, settings, is_active: body.is_active === undefined ? current.is_active : Boolean(body.is_active), updated_at: new Date().toISOString() }).eq('id', params.id).select().single();
    if (error) throw error;
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('[super] tenant update failed', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to update tenant' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  try {
    const { data: tenant, error: tenantError } = await getTenant(service, params.id);
    if (tenantError) throw tenantError;
    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    const { data: images } = await (service.from('property_images') as any).select('storage_path').eq('tenant_id', params.id);
    if (images?.length) await service.storage.from('property-images').remove(images.map((image: { storage_path: string }) => image.storage_path));
    await (service.from('property_images') as any).delete().eq('tenant_id', params.id);
    await (service.from('properties') as any).delete().eq('tenant_id', params.id);
    await (service.from('collection_properties') as any).delete().in('collection_id', (await (service.from('collections') as any).select('id').eq('tenant_id', params.id)).data?.map((row: { id: string }) => row.id) || ['00000000-0000-0000-0000-000000000000']);
    await (service.from('collections') as any).delete().eq('tenant_id', params.id);
    await (service.from('whatsapp_conversations') as any).delete().eq('tenant_id', params.id);
    await (service.from('whatsapp_authorized_numbers') as any).delete().eq('tenant_id', params.id);
    const { data: profiles } = await (service.from('profiles') as any).select('id').eq('tenant_id', params.id);
    await (service.from('profiles') as any).delete().eq('tenant_id', params.id);
    for (const profile of profiles || []) await service.auth.admin.deleteUser(profile.id);
    const { error } = await (service.from('tenants') as any).delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[super] tenant deletion failed', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to delete tenant' }, { status: 500 });
  }
}
