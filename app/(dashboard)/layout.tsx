import { requireTenantAdmin } from '@/app/lib/auth/session';
import { TenantProvider } from '@/app/lib/tenant/context';
import Sidebar from '@/src/components/dashboard/Sidebar';
import Header from '@/src/components/dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, tenant, profile } = await requireTenantAdmin();

  return (
    <TenantProvider tenant={tenant} profile={profile}>
      <div className="flex h-screen bg-[var(--bg-primary)]">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}