import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface TenantContext {
  user: any;
  tenant: any;
  profile: any;
}

export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

export async function requireTenantAdmin(): Promise<TenantContext> {
  const user = await requireAuth();

  const supabase = await createClient();

  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileResult.data as any;
  if (!profile || (profile.role !== 'tenant_admin' && profile.role !== 'super_admin')) {
    redirect('/login');
  }

  const tenantResult = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .maybeSingle();

  const tenant = tenantResult.data as any;
  if (!tenant) {
    redirect('/login');
  }

  return { user, tenant, profile };
}

export async function requireSuperAdmin(): Promise<{ user: any; profile: any }> {
  const user = await requireAuth();

  const supabase = await createClient();

  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileResult.data as any;
  if (!profile || profile.role !== 'super_admin') {
    redirect('/login');
  }

  return { user, profile };
}

export async function getSuperAdminContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (profile as any).role !== 'super_admin') return null;
  return { user, profile };
}

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return result.data;
}

export async function getTenantByUserId(userId: string) {
  const supabase = await createClient();

  const profileResult = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .maybeSingle();

  const profile = profileResult.data as any;
  if (!profile) return null;

  const tenantResult = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .maybeSingle();

  return tenantResult.data;
}
