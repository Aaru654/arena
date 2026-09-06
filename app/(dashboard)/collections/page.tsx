import Link from 'next/link';
import { FolderOpen, Plus } from 'lucide-react';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import CollectionsList from '@/src/components/collection/CollectionsList';
import { CollectionRecord } from '@/src/components/collection/types';

export default async function CollectionsPage() {
  const { tenant, profile } = await requireTenantAdmin();
  const supabase = await createClient();
  const { data } = await (supabase.from('collections') as any)
    .select('*, collection_properties(id)')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const collections = ((data || []) as Array<CollectionRecord & { collection_properties?: { id: string }[] }>).map((collection) => ({
    ...collection,
    property_count: collection.collection_properties?.length || 0,
  }));
  const tenantSettings = (tenant.settings || {}) as Record<string, unknown>;
  const tenantSubdomain = tenant.subdomain || tenant.slug;
  const whatsappNumber = (tenantSettings.whatsapp_number as string | undefined) || tenant.whatsapp_number;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-zilla text-3xl text-[var(--foreground)]">Collections</h1>
        <Link href="/dashboard/collections/new" className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:opacity-90"><Plus className="h-4 w-4" />New Collection</Link>
      </div>
      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-20 text-center">
          <FolderOpen className="h-12 w-12 text-[var(--text-muted)]" />
          <h2 className="mt-4 font-zilla text-2xl text-[var(--foreground)]">No collections yet</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">Group your properties into collections to share multiple listings at once.</p>
          <Link href="/dashboard/collections/new" className="mt-6 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">Create Collection</Link>
        </div>
      ) : <CollectionsList collections={collections} tenantSubdomain={tenantSubdomain} whatsappNumber={whatsappNumber} />}
    </div>
  );
}
