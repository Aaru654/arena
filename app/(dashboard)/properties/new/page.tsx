import { requireTenantAdmin } from '@/app/lib/auth/session';
import { PropertyForm } from '@/src/components/property/PropertyForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function CreatePropertyPage() {
  const { tenant } = await requireTenantAdmin();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/properties"
          className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Properties
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-[var(--foreground)]">New Property</span>
      </div>

      {/* Form */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
        <h1 className="text-2xl font-zilla text-[var(--foreground)] mb-6">Create New Property</h1>
        
        <PropertyForm
          tenantId={tenant.id}
          onSuccess={(propertyId: string) => {
            // Redirect to edit page where images can be uploaded
            window.location.href = `/dashboard/properties/${propertyId}`;
          }}
        />
      </div>
    </div>
  );
}
