import { createClient } from '@/app/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, formatSpecs, getStorageUrl } from '@/app/lib/utils/property';
import PropertyGallery from '@/src/components/property/PropertyGallery';
import { PropertyWithTenantAndImages, PropertyImage, Tenant } from '@/app/types/database';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPropertyBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      tenants(id, slug, name, contact_email, whatsapp_number)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return { property: data as PropertyWithTenantAndImages | null, error };
}

async function getPropertyImages(propertyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', propertyId)
    .order('is_cover', { ascending: false })
    .order('display_order', { ascending: true });

  return { images: (data as PropertyImage[]) || [], error };
}

export async function generateMetadata({ params }: PageProps) {
  const { property } = await getPropertyBySlug(params.slug);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  const tenant = (property.tenants as unknown as Tenant);
  const images = property.property_images as PropertyImage[];
  const primaryImage = images?.[0];
  const imageUrl = primaryImage
    ? getStorageUrl(primaryImage.storage_path)
    : null;

  return {
    title: `${property.title} | ${tenant.name}`,
    description: property.description?.slice(0, 160) || `View this property on ${tenant.name}`,
    openGraph: {
      title: property.title,
      description: property.description || '',
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PublicPropertyPage({ params }: PageProps) {
  const { property, error } = await getPropertyBySlug(params.slug);

  if (error || !property) {
    notFound();
  }

  const { images } = await getPropertyImages(property.id);
  const tenant = (property.tenants as unknown as Tenant);

  // Build WhatsApp link
  const whatsappNumber = tenant.whatsapp_number;
  const propertyUrl = `https://${tenant.slug}.addbrokr.com/p/${property.slug}`;
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in: ${property.title}\n${property.city || property.location}\nPrice: ${formatPrice(property.price)}\n${propertyUrl}`
  );
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappText}`
    : '#';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Tenant Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {tenant.name ? (
              <span className="font-semibold text-[var(--foreground)]">{tenant.name}</span>
            ) : (
              <span className="text-[var(--text-muted)]">Properties</span>
            )}
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1FAF56] text-white rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Enquire
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Gallery */}
        {images.length > 0 && (
          <PropertyGallery images={images} />
        )}

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Info - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-zilla text-[var(--foreground)] mb-2">
                {property.title}
              </h1>
              <p className="text-lg text-[var(--accent)] font-semibold">
                {formatPrice(property.price)}
              </p>
            </div>

            {/* Location & Specs */}
            <div className="space-y-3 pb-6 border-b border-[var(--border)]">
              {property.location && (
                <p className="text-[var(--text-muted)]">
                  📍 {property.location}
                  {property.city && `, ${property.city}`}
                </p>
              )}

              {(property.bedrooms || property.bathrooms || property.area_sqft) && (
                <p className="text-[var(--text-muted)]">
                  {formatSpecs(
                    property.bedrooms,
                    property.bathrooms,
                    property.area_sqft
                  )}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] rounded-full text-sm capitalize">
                  {property.property_type}
                </span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  About this property
                </h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  Features
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: string) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-medium"
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* WhatsApp CTA - Sticky on desktop, normal on mobile */}
            <div className="lg:sticky lg:top-4 space-y-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1FAF56] text-white text-lg font-semibold rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Enquire on WhatsApp
              </a>

              {/* Contact Info Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-[var(--foreground)]">Contact Details</h3>
                {tenant.contact_email && (
                  <p className="text-sm text-[var(--text-muted)]">
                    📧 <span className="text-[var(--foreground)]">{tenant.contact_email}</span>
                  </p>
                )}
                {tenant.whatsapp_number && (
                  <p className="text-sm text-[var(--text-muted)]">
                    💬 <span className="text-[var(--foreground)]">{tenant.whatsapp_number}</span>
                  </p>
                )}
              </div>

              {/* Share */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(propertyUrl);
                    alert('Link copied!');
                  }}
                  className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-sm"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
