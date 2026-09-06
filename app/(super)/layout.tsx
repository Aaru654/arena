import Link from 'next/link';
import { requireSuperAdmin } from '@/app/lib/auth/session';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSuperAdmin();
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/super-admin/tenants" className="font-zilla text-xl">AddBrokr Super Admin</Link>
          <div className="flex items-center gap-4 text-sm"><span className="text-[var(--text-muted)]">{user.email}</span><Link href="/logout" className="text-[var(--text-muted)] hover:text-[var(--foreground)]">Sign out</Link></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
