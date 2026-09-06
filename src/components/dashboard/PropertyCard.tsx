'use client';

import { Building2, MapPin, Bed, Bath, Square } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatSpecs, getStorageUrl } from '@/app/lib/utils/property';

interface PropertyImage {
  id: string;
  storage_path: string;
  is_cover: boolean;
  display_order: number;
}

interface Property {
  id: string;
  slug: string;
  title: string;
  location?: string;
  city?: string;
  price?: number;
  property_type: string;
  status: 'draft' | 'published' | 'archived';
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  property_images?: PropertyImage[];
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const getPrimaryImage = (images?: PropertyImage[]) => {
    if (!images || images.length === 0) return null;
    const primary = images.find(img => img.is_cover);
    return primary || images[0];
  };

  const primaryImage = getPrimaryImage(property.property_images);
  const imageUrl = primaryImage ? getStorageUrl(primaryImage.storage_path) : null;

  const statusColors = {
    published: 'bg-green-500/10 text-green-700 dark:text-green-400',
    draft: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    archived: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent)] transition-colors group">
      <div className="aspect-video bg-[var(--bg-elevated)] relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-[var(--text-muted)]" />
          </div>
        )}
        <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[property.status]}`}>
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-[var(--foreground)] line-clamp-1">
            {property.title}
          </h4>
        </div>
        <div className="flex items-center text-sm text-[var(--text-muted)]">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.city || property.location || 'No location'}</span>
        </div>
        <div className="flex items-center justify-between">
          {property.price && (
            <span className="font-bold text-[var(--accent)]">
              {formatPrice(property.price)}
            </span>
          )}
          <span className="text-xs text-[var(--text-muted)] capitalize">
            {property.property_type}
          </span>
        </div>
        {(property.bedrooms || property.bathrooms || property.area_sqft) && (
          <div className="text-xs text-[var(--text-muted)] py-2 border-t border-[var(--border)]">
            {formatSpecs(property.bedrooms, property.bathrooms, property.area_sqft)}
          </div>
        )}
        <Link
          href={`/dashboard/properties/${property.id}`}
          className="block w-full text-center px-3 py-2 bg-[var(--bg-elevated)] text-[var(--foreground)] rounded-md hover:bg-[var(--bg-surface)] transition-colors text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}