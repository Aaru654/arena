import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSuperAdmin } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';
import TenantList from '@/src/components/super/TenantList';
import { SuperTenant } from '@/src/components/super/types';

export default async function TenantsPage() {
  await requireSuperAdmin();
  const service = await createServiceClient();
  const { data } = await (service.from('tenants') as any).select('*, properties(id), profiles(id)').order('created_at', { ascending: false });
  const tenants = ((data || []) as Array<SuperTenant & { properties?: { id: string }[]; profiles?: { id: string }[] }>).map((tenant) => ({ ...tenant, property_count: tenant.properties?.length || 0, user_count: tenant.profiles?.length || 0 }));
  const activeCount = tenants.filter((tenant) => tenant.is_active).length;
  const propertyCount = tenants.reduce((total, tenant) => total + tenant.property_count, 0);
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="font-zilla text-3xl">Tenants</h1><Link href="/super-admin/tenants/new" className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]"><Plus className="h-4 w-4" />New Tenant</Link></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5"><p className="text-sm text-[var(--text-muted)]">Total tenants</p><p className="mt-2 font-zilla text-3xl">{tenants.length}</p></div><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5"><p className="text-sm text-[var(--text-muted)]">Active tenants</p><p className="mt-2 font-zilla text-3xl">{activeCount}</p></div><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5"><p className="text-sm text-[var(--text-muted)]">Platform properties</p><p className="mt-2 font-zilla text-3xl">{propertyCount}</p></div></div>{tenants.length === 0 ? <div className="rounded-lg border border-dashed border-[var(--border)] py-20 text-center text-[var(--text-muted)]">No tenants yet. Create your first tenant.</div> : <TenantList tenants={tenants} />}</div>;
}
