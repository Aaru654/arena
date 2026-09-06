'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SuperTenant } from './types';

interface TenantRow extends SuperTenant { property_count: number; user_count: number }

export default function TenantList({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<SuperTenant | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toggle = async (tenant: TenantRow) => {
    setBusyId(tenant.id);
    const response = await fetch(`/api/super/tenants/${tenant.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !tenant.is_active }) });
    setBusyId(null);
    if (!response.ok) toast.error('Unable to update tenant'); else router.refresh();
  };
  const remove = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    const response = await fetch(`/api/super/tenants/${deleting.id}`, { method: 'DELETE' });
    setBusyId(null);
    if (!response.ok) toast.error('Unable to delete tenant'); else { toast.success('Tenant deleted'); setDeleting(null); router.refresh(); }
  };
  return <>
    <div className="hidden overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] md:block"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-muted)]"><tr>{['Name', 'Subdomain', 'Plan', 'Properties', 'Users', 'Status', 'Created', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{tenants.map((tenant) => <tr key={tenant.id}><td className="px-4 py-4 font-medium text-[var(--foreground)]">{tenant.name}</td><td className="px-4 py-4 text-[var(--text-muted)]">{tenant.subdomain}</td><td className="px-4 py-4"><span className="rounded-full bg-[var(--accent)]/10 px-2 py-1 text-xs capitalize text-[var(--accent)]">{tenant.settings?.plan || 'starter'}</span></td><td className="px-4 py-4 text-[var(--text-muted)]">{tenant.property_count}</td><td className="px-4 py-4 text-[var(--text-muted)]">{tenant.user_count}</td><td className="px-4 py-4"><button type="button" onClick={() => toggle(tenant)} disabled={busyId === tenant.id} className={`rounded-full px-2 py-1 text-xs ${tenant.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{tenant.is_active ? 'Active' : 'Inactive'}</button></td><td className="whitespace-nowrap px-4 py-4 text-[var(--text-muted)]">{new Date(tenant.created_at).toLocaleDateString()}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><Link href={`/super-admin/tenants/${tenant.id}`} aria-label={`Edit ${tenant.name}`} className="text-[var(--text-muted)] hover:text-[var(--foreground)]"><Pencil className="h-4 w-4" /></Link><a href={`https://${tenant.subdomain}.addbrokr.com`} target="_blank" rel="noopener noreferrer" aria-label={`View ${tenant.name}`} className="text-[var(--text-muted)] hover:text-[var(--foreground)]"><ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => setDeleting(tenant)} aria-label={`Delete ${tenant.name}`} className="text-[var(--text-muted)] hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
    <div className="grid gap-4 md:hidden">{tenants.map((tenant) => <article key={tenant.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4"><div className="flex items-start justify-between"><div><h2 className="font-zilla text-xl text-[var(--foreground)]">{tenant.name}</h2><p className="text-sm text-[var(--text-muted)]">{tenant.subdomain}.addbrokr.com</p></div><button type="button" onClick={() => toggle(tenant)} className={`rounded-full px-2 py-1 text-xs ${tenant.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{tenant.is_active ? 'Active' : 'Inactive'}</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-sm"><span className="text-[var(--text-muted)]">Plan<br /><strong className="capitalize text-[var(--foreground)]">{tenant.settings?.plan || 'starter'}</strong></span><span className="text-[var(--text-muted)]">Properties<br /><strong className="text-[var(--foreground)]">{tenant.property_count}</strong></span><span className="text-[var(--text-muted)]">Users<br /><strong className="text-[var(--foreground)]">{tenant.user_count}</strong></span></div><div className="mt-4 flex gap-3 border-t border-[var(--border)] pt-3"><Link href={`/super-admin/tenants/${tenant.id}`} className="text-sm text-[var(--accent)]">Edit</Link><a href={`https://${tenant.subdomain}.addbrokr.com`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)]">View</a><button type="button" onClick={() => setDeleting(tenant)} className="ml-auto text-sm text-red-400">Delete</button></div></article>)}</div>
    {deleting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="font-zilla text-2xl text-[var(--foreground)]">Delete tenant?</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Delete &quot;{deleting.name}&quot; and all of its data? This cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDeleting(null)} className="rounded-md px-4 py-2 text-sm text-[var(--foreground)]">Cancel</button><button type="button" onClick={remove} disabled={busyId === deleting.id} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete</button></div></div></div>}
  </>;
}
