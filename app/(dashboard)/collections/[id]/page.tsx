import Link from 'next/link';
import { ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { CollectionForm } from '@/src/components/collection/CollectionForm';
import DeleteCollectionButton from '@/src/components/collection/DeleteCollectionButton';
import { CollectionProperty, CollectionRecord } from '@/src/components/collection/types';

interface PageProps { params: { id: string } }

export default async function EditCollectionPage({ params }: PageProps) {
  const { tenant } = await requireTenantAdmin();
  const supabase = await createClient();
  const [{ data: collection }, { data: properties }] = await Promise.all([
    (supabase.from('collections') as any).select('*, collection_properties(sort_order, properties(id, title, city, address, location, price, currency, status, metadata, bedrooms, bathrooms, area_sqft, property_images(storage_path, is_primary, sort_order)))').eq('id', params.id).eq('tenant_id', tenant.id).maybeSingle(),
    (supabase.from('properties') as any).select('id, title, city, address, price, currency, status, metadata, bedrooms, bathrooms, area_sqft, property_images(storage_path, is_primary, sort_order)').eq('tenant_id', tenant.id).order('created_at', { ascending: false }),
  ]);
  if (!collection) notFound();

  const collectionProperties = ((collection.collection_properties || []) as Array<{ sort_order: number; properties: CollectionProperty }>).sort((a, b) => a.sort_order - b.sort_order).map((item) => item.properties);
  const initialData = { ...(collection as CollectionRecord), properties: collectionProperties };
  const tenantSettings = (tenant.settings || {}) as Record<string, unknown>;
  const tenantSubdomain = tenant.subdomain || tenant.slug;
  const whatsappNumber = (tenantSettings.whatsapp_number as string | undefined) || tenant.whatsapp_number;
  const publicUrl = `https://${tenantSubdomain}.addbrokr.com/c/${collection.slug}`;
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Check out these properties: ${publicUrl}`)}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm"><Link href="/dashboard/collections" className="text-[var(--text-muted)] hover:text-[var(--foreground)]">Collections</Link><ChevronRight className="h-4 w-4 text-[var(--text-muted)]" /><span className="truncate text-[var(--foreground)]">{collection.name}</span></div>
      <div className="flex flex-wrap items-start justify-between gap-4"><h1 className="font-zilla text-3xl text-[var(--foreground)]">Edit Collection</h1><div className="flex flex-wrap gap-2">{collection.is_public && <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--foreground)]"><ExternalLink className="h-4 w-4" />View Public Page</a>}{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-sm text-white"><MessageCircle className="h-4 w-4" />Share on WhatsApp</a>}</div></div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><CollectionForm initialData={initialData} tenantId={tenant.id} allProperties={(properties || []) as CollectionProperty[]} /></div>
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6"><h2 className="font-zilla text-xl text-red-400">Danger Zone</h2><p className="mt-1 mb-4 text-sm text-[var(--text-muted)]">Deleting this collection removes its property links, but never deletes the properties.</p><DeleteCollectionButton id={collection.id} name={collection.name} /></div>
    </div>
  );
}
