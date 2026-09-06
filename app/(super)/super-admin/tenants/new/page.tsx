import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { requireSuperAdmin } from '@/app/lib/auth/session';
import TenantForm from '@/src/components/super/TenantForm';

export default async function NewTenantPage() {
  await requireSuperAdmin();
  return <div className="space-y-6"><div className="flex items-center gap-2 text-sm"><Link href="/super-admin/tenants" className="text-[var(--text-muted)]">Tenants</Link><ChevronRight className="h-4 w-4 text-[var(--text-muted)]" /><span>New Tenant</span></div><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h1 className="mb-6 font-zilla text-3xl">Create Tenant</h1><TenantForm mode="create" /></div></div>;
}
