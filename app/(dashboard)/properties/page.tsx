'use server';

import { createClient } from '@/app/lib/supabase/server';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Plus, Edit, Eye, Copy, Share2, Trash2 } from 'lucide-react';
import { formatPrice, formatSpecs, getStorageUrl } from '@/app/lib/utils/property';
import { PropertyWithImages } from '@/app/types/database';

async function getProperties(tenantId: string) {
  const supabase = await createClient();

  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      id, slug, title, property_type, status, price, location, city,
      bedrooms, bathrooms, area_sqft, created_at, updated_at,
      property_images(id, storage_path, is_cover, display_order)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return properties || [];
}

export default async function PropertiesPage() {
  const { tenant } = await requireTenantAdmin();
  const properties = await getProperties(tenant.id) as PropertyWithImages[];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getPrimaryImage = (images: any[]) => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.is_cover);
    return primary || images[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-zilla text-[var(--foreground)]">Properties</h1>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Properties */}
      {properties.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No properties yet</h3>
          <p className="text-[var(--text-muted)] mb-6">
            Send a WhatsApp message to create your first listing, or add one manually.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md hover:opacity-90"
          >
            Create Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property: PropertyWithImages) => {
            const primaryImage = getPrimaryImage(property.property_images);
            const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;

            return (
              <div
                key={property.id}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-colors group"
              >
                {/* Image */}
                <div className="relative aspect-video bg-[var(--bg-elevated)] overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeColor(property.status)}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {property.city || property.location || 'No location'}
                    </p>
                  </div>

                  {/* Price and Type */}
                  {property.price && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--accent)]">
                        {formatPrice(property.price)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] capitalize">
                        {property.property_type}
                      </span>
                    </div>
                  )}

                  {/* Specs */}
                  {(property.bedrooms || property.bathrooms || property.area_sqft) && (
                    <div className="text-xs text-[var(--text-muted)] py-2 border-t border-[var(--border)]">
                      {formatSpecs(property.bedrooms, property.bathrooms, property.area_sqft)}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/properties/${property.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[var(--foreground)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Link>
                    
                    {property.status === 'published' && (
                      <Link
                        href={`/p/${property.slug}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-[var(--foreground)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] rounded transition-colors"
                        title="View public page"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
