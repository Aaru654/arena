import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';
import TenantForm from '@/src/components/super/TenantForm';
import TenantTabs from '@/src/components/super/TenantTabs';
import TenantDangerZone from '@/src/components/super/TenantDangerZone';
import UserManager from '@/src/components/super/UserManager';
import WhatsAppNumbersManager from '@/src/components/super/WhatsAppNumbersManager';
import { AuthorizedNumber, SuperTenant } from '@/src/components/super/types';

interface PageProps { params: { id: string } }

export default async function EditTenantPage({ params }: PageProps) {
  await requireSuperAdmin();
  const service = await createServiceClient();
  const [{ data: tenant }, { data: profiles }, { data: properties }, { data: numbers }] = await Promise.all([
    (service.from('tenants') as any).select('*').eq('id', params.id).maybeSingle(),
    (service.from('profiles') as any).select('id, email, full_name, role, is_active, created_at').eq('tenant_id', params.id).order('created_at', { ascending: false }),
    (service.from('properties') as any).select('id, title, status, city, created_at').eq('tenant_id', params.id).order('created_at', { ascending: false }),
    (service.from('whatsapp_authorized_numbers') as any).select('*').eq('tenant_id', params.id).order('created_at', { ascending: false }),
  ]);
  if (!tenant) notFound();
  const publicUrl = `https://${tenant.subdomain}.addbrokr.com`;
  return <div className="space-y-6"><div className="flex items-center gap-2 text-sm"><Link href="/super-admin/tenants" className="text-[var(--text-muted)]">Tenants</Link><ChevronRight className="h-4 w-4 text-[var(--text-muted)]" /><span>{tenant.name}</span></div><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-zilla text-3xl">{tenant.name}</h1><p className="mt-1 text-sm text-[var(--text-muted)]">{tenant.subdomain}.addbrokr.com</p></div><a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm"><ExternalLink className="h-4 w-4" />View tenant</a></div><TenantTabs details={<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><TenantForm initialData={tenant as SuperTenant} mode="edit" /></div>} users={<UserManager tenantId={tenant.id} initialUsers={profiles || []} />} properties={<div className="space-y-3"><p className="text-sm text-[var(--text-muted)]">{properties?.length || 0} properties</p><div className="overflow-x-auto rounded-md border border-[var(--border)]"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-muted)]"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{(properties || []).map((property: any) => <tr key={property.id}><td className="px-4 py-3">{property.title}</td><td className="px-4 py-3 text-[var(--text-muted)]">{property.city || '-'}</td><td className="px-4 py-3 capitalize text-[var(--text-muted)]">{property.status}</td></tr>)}</tbody></table></div></div>} whatsapp={<WhatsAppNumbersManager tenantId={tenant.id} initialNumbers={(numbers || []) as AuthorizedNumber[]} />} /><div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6"><h2 className="font-zilla text-xl text-red-400">Danger Zone</h2><p className="my-2 text-sm text-[var(--text-muted)]">Deactivate access or permanently remove this tenant and all associated data.</p><TenantDangerZone tenantId={tenant.id} isActive={tenant.is_active} /></div></div>;
}
