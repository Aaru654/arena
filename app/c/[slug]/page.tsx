import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Bath, ExternalLink, ImageIcon, MapPin, MessageCircle, Square } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import { formatPrice, formatSpecs, getStorageUrl } from '@/app/lib/utils/property';
import { CollectionImage, CollectionProperty } from '@/src/components/collection/types';

interface PageProps { params: { slug: string } }

async function getCollection(slug: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('collections') as any).select('*, tenants(name, subdomain, slug, branding, settings)').eq('slug', slug).eq('is_public', true).maybeSingle();
  return { collection: data, error };
}

async function getCollectionProperties(collectionId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('collection_properties') as any)
    .select('sort_order, properties(id, title, description, price, currency, city, address, location, metadata, bedrooms, bathrooms, area_sqft, status, property_images(storage_path, is_primary, sort_order))')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });
  return { properties: (data || []).filter((item: { properties?: CollectionProperty }) => item.properties?.status === 'published').map((item: { properties: CollectionProperty }) => item.properties), error };
}

function getPrimaryImage(property: CollectionProperty) {
  return property.property_images?.find((image) => image.is_primary || image.is_cover) || property.property_images?.[0];
}

export async function generateMetadata({ params }: PageProps) {
  const { collection } = await getCollection(params.slug);
  if (!collection) return { title: 'Collection Not Found' };
  const { properties } = await getCollectionProperties(collection.id);
  const tenant = collection.tenants as { name: string };
  const firstImage = properties[0] && getPrimaryImage(properties[0]);
  return { title: `${collection.name} | ${tenant.name}`, description: collection.description || `Browse ${properties.length} properties`, openGraph: { title: collection.name, description: collection.description || `Browse ${properties.length} properties`, images: firstImage ? [getStorageUrl(firstImage.storage_path)] : [] } };
}

export default async function PublicCollectionPage({ params }: PageProps) {
  const { collection, error } = await getCollection(params.slug);
  if (error || !collection) notFound();
  const { properties } = await getCollectionProperties(collection.id);
  const tenant = collection.tenants as { name: string; subdomain?: string; slug?: string; branding?: Record<string, unknown>; settings?: Record<string, unknown>; whatsapp_number?: string };
  const subdomain = tenant.subdomain || tenant.slug || '';
  const settings = tenant.settings || {};
  const whatsappNumber = (settings.whatsapp_number as string | undefined) || tenant.whatsapp_number;
  const collectionUrl = `https://${subdomain}.addbrokr.com/c/${params.slug}`;
  const allPropertiesText = encodeURIComponent(`Hi! Please share details about these properties:\n${collection.name}\n${collectionUrl}`);
  const allPropertiesLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${allPropertiesText}` : '#';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20 md:pb-0">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Link href="/" className="font-zilla text-xl text-[var(--foreground)]">{tenant.name}</Link>{whatsappNumber && <a href={allPropertiesLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white"><MessageCircle className="h-4 w-4" />Enquire</a>}</div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-10 max-w-3xl"><p className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--accent)]">Property collection</p><h1 className="font-zilla text-4xl text-[var(--foreground)] md:text-5xl">{collection.name}</h1>{collection.description && <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{collection.description}</p>}<div className="mt-5 flex flex-wrap items-center gap-3"><span className="rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-sm font-medium text-[var(--accent)]">{properties.length} {properties.length === 1 ? 'Property' : 'Properties'}</span>{whatsappNumber && <a href={allPropertiesLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white"><MessageCircle className="h-4 w-4" />Enquire about all</a>}</div></section>
        {properties.length === 0 ? <div className="rounded-lg border border-dashed border-[var(--border)] py-20 text-center text-[var(--text-muted)]">No published properties in this collection yet.</div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{properties.map((property: CollectionProperty) => {
          const image = getPrimaryImage(property);
          const propertySlug = typeof property.metadata?.slug === 'string' ? property.metadata.slug : '';
          const propertyUrl = propertySlug ? `/p/${propertySlug}` : '#';
          const propertyText = encodeURIComponent(`Hi! I'm interested in ${property.title}\n${collectionUrl}`);
          const propertyWhatsapp = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${propertyText}` : '#';
          return <article key={property.id} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]"><div className="relative aspect-video bg-[var(--bg-elevated)]">{image ? <Image src={getStorageUrl(image.storage_path)} alt={property.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-12 w-12 text-[var(--text-muted)]" /></div>}</div><div className="space-y-4 p-5"><div><h2 className="line-clamp-1 font-zilla text-2xl text-[var(--foreground)]">{property.title}</h2><p className="mt-1 flex items-center gap-1 text-sm text-[var(--text-muted)]"><MapPin className="h-4 w-4" />{property.city || property.address || property.location || 'Location unavailable'}</p></div><p className="text-lg font-semibold text-[var(--accent)]">{formatPrice(property.price, property.currency || 'INR')}</p>{(property.bedrooms || property.bathrooms || property.area_sqft) && <div className="flex flex-wrap gap-3 border-y border-[var(--border)] py-3 text-xs text-[var(--text-muted)]"><span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.bedrooms ?? '-'} beds</span><span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{property.bathrooms ?? '-'} baths</span><span className="inline-flex items-center gap-1"><Square className="h-4 w-4" />{property.area_sqft ? `${property.area_sqft.toLocaleString()} sqft` : '-'}</span></div>}<div className="flex flex-wrap gap-2">{propertySlug && <Link href={propertyUrl} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-foreground)]"><ExternalLink className="h-4 w-4" />View Property</Link>}{whatsappNumber && <a href={propertyWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white"><MessageCircle className="h-4 w-4" />Enquire</a>}</div></div></article>;
        })}</div>}
      </main>
      {whatsappNumber && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-surface)] p-3 md:hidden"><a href={allPropertiesLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 font-medium text-white"><MessageCircle className="h-5 w-5" />Enquire about all properties</a></div>}
    </div>
  );
}
