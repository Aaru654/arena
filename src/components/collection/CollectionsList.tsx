'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionCard, CollectionDeleteDialog } from './CollectionCard';
import { CollectionRecord } from './types';

export default function CollectionsList({
  collections,
  tenantSubdomain,
  whatsappNumber,
}: {
  collections: Array<CollectionRecord & { property_count: number; cover_image?: string | null }>;
  tenantSubdomain: string;
  whatsappNumber?: string | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<CollectionRecord | null>(null);

  if (collections.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {collections.map((collection) => <CollectionCard key={collection.id} collection={collection} tenantSubdomain={tenantSubdomain} whatsappNumber={whatsappNumber} onDelete={setDeleting} />)}
      </div>
      {deleting && <CollectionDeleteDialog collection={deleting} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); router.refresh(); }} />}
    </>
  );
}
