import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { requireTenantAdmin } from '@/app/lib/auth/session';

export async function PATCH(request: NextRequest) {
  try {
    const { tenant, user } = await requireTenantAdmin();
    const body = await request.json();
    const supabase = await createClient();
    const requestedTenantId = body.tenantId as string | undefined;
    if (requestedTenantId && requestedTenantId !== tenant.id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    if (body.name !== undefined || body.whatsapp_number !== undefined || body.contact_email !== undefined || body.logo_url !== undefined || body.primary_color !== undefined) {
      const { data: current, error: currentError } = await (supabase.from('tenants') as any).select('name, settings, branding').eq('id', tenant.id).single();
      if (currentError) throw currentError;
      const settings = { ...(current.settings || {}) };
      const branding = { ...(current.branding || {}) };
      if (body.whatsapp_number !== undefined) settings.whatsapp_number = body.whatsapp_number;
      if (body.contact_email !== undefined) settings.contact_email = body.contact_email;
      if (body.logo_url !== undefined) branding.logo_url = body.logo_url || null;
      if (body.primary_color !== undefined) branding.primary_color = body.primary_color;
      const { error } = await (supabase.from('tenants') as any).update({ ...(body.name !== undefined ? { name: String(body.name).trim() } : {}), settings, branding, updated_at: new Date().toISOString() }).eq('id', tenant.id);
      if (error) throw error;
    }
    if (body.profileId !== undefined) {
      if (body.profileId !== user.id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      const { error } = await (supabase.from('profiles') as any).update({ full_name: body.full_name, avatar_url: body.avatar_url || null, updated_at: new Date().toISOString() }).eq('id', user.id).eq('tenant_id', tenant.id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to save settings' }, { status: 500 });
  }
}
