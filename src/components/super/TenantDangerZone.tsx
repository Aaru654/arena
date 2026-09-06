'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TenantDangerZone({ tenantId, isActive }: { tenantId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const deactivate = async () => {
    setBusy(true);
    const response = await fetch(`/api/super/tenants/${tenantId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) });
    setBusy(false);
    if (!response.ok) toast.error('Unable to update tenant'); else { toast.success(isActive ? 'Tenant deactivated' : 'Tenant activated'); router.refresh(); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this tenant and all of its data? This cannot be undone.')) return;
    setBusy(true);
    const response = await fetch(`/api/super/tenants/${tenantId}`, { method: 'DELETE' });
    if (!response.ok) { setBusy(false); toast.error('Unable to delete tenant'); return; }
    router.push('/super-admin/tenants');
  };
  return <div className="flex flex-wrap gap-3"><button type="button" onClick={deactivate} disabled={busy} className="rounded-md border border-yellow-600 px-4 py-2 text-sm text-yellow-400">{isActive ? 'Deactivate Tenant' : 'Activate Tenant'}</button><button type="button" onClick={remove} disabled={busy} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete Tenant</button></div>;
}
