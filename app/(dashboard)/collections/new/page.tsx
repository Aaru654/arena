import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { CollectionForm } from '@/src/components/collection/CollectionForm';
import { CollectionProperty } from '@/src/components/collection/types';

export default async function NewCollectionPage() {
  const { tenant } = await requireTenantAdmin();
  const supabase = await createClient();
  const { data } = await (supabase.from('properties') as any)
    .select('id, title, city, address, price, currency, status, metadata, bedrooms, bathrooms, area_sqft, property_images(storage_path, is_primary, sort_order)')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });
  const properties = (data || []) as CollectionProperty[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm"><Link href="/dashboard/collections" className="text-[var(--text-muted)] hover:text-[var(--foreground)]">Collections</Link><ChevronRight className="h-4 w-4 text-[var(--text-muted)]" /><span className="text-[var(--foreground)]">New Collection</span></div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h1 className="mb-6 font-zilla text-3xl text-[var(--foreground)]">New Collection</h1><CollectionForm tenantId={tenant.id} allProperties={properties} /></div>
    </div>
  );
}
