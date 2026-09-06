import { createClient } from '@/app/lib/supabase/server';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { PropertyForm } from '@/src/components/property/PropertyForm';
import { ImageUploader } from '@/src/components/property/ImageUploader';
import DeletePropertyButton from '@/src/components/property/DeletePropertyButton';
import { PropertyWithImages } from '@/app/types/database';

interface PageProps {
  params: {
    id: string;
  };
}

async function getProperty(propertyId: string, tenantId: string) {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      id, slug, title, description, property_type, status, price, location, city,
      bedrooms, bathrooms, area_sqft, features, created_at, updated_at,
      property_images(id, property_id, storage_path, display_order, is_cover)
    `)
    .eq('id', propertyId)
    .eq('tenant_id', tenantId)
    .single();

  return { property: property as PropertyWithImages | null, error };
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { tenant } = await requireTenantAdmin();
  const { property, error } = await getProperty(params.id, tenant.id);

  if (error || !property) {
    notFound();
  }

  const publicUrl = property.status === 'published'
    ? `https://${tenant.slug}.addbrokr.com/p/${property.slug}`
    : null;

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
        <span className="text-[var(--foreground)] line-clamp-1">{property.title}</span>
      </div>

      {/* Header with actions */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-zilla text-[var(--foreground)]">Edit Property</h1>
        <div className="flex gap-2">
          {publicUrl && (
            <Link
              href={publicUrl}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--foreground)] rounded-md hover:bg-[var(--bg-surface)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public
            </Link>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <PropertyForm
            initialData={property}
            tenantId={tenant.id}
            propertyId={property.id}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>

        {/* Images - sidebar */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
          <ImageUploader
            propertyId={property.id}
            tenantId={tenant.id}
            existingImages={property.property_images || []}
            onImagesChange={() => {
              // Images updated
            }}
          />
        </div>
      </div>

      {/* Delete section */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Deleting this property will remove it permanently along with all associated images.
        </p>
        <DeletePropertyButton
          propertyId={property.id}
          tenantId={tenant.id}
          title={property.title}
        />
      </div>
    </div>
  );
}
