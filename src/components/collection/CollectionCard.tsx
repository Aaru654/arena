'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Copy, FolderOpen, ImageIcon, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStorageUrl } from '@/app/lib/utils/property';
import { CollectionRecord } from './types';

interface CollectionCardProps {
  collection: CollectionRecord & { property_count: number; cover_image?: string | null };
  tenantSubdomain: string;
  whatsappNumber?: string | null;
  onDelete: (collection: CollectionRecord) => void;
}

export function CollectionCard({ collection, tenantSubdomain, whatsappNumber, onDelete }: CollectionCardProps) {
  const collectionUrl = `https://${tenantSubdomain}.addbrokr.com/c/${collection.slug}`;
  const coverPath = collection.cover_image_path || collection.cover_image;
  const share = async () => {
    try {
      await navigator.clipboard.writeText(collectionUrl);
      toast.success('Collection link copied');
    } catch {
      toast.error('Unable to copy collection link');
    }
  };
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Check out these properties: ${collectionUrl}`)}`
    : null;

  return (
    <article className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="relative aspect-[16/8] bg-[var(--bg-elevated)]">
        {coverPath ? <Image src={getStorageUrl(coverPath)} alt={collection.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /> : <div className="flex h-full items-center justify-center"><FolderOpen className="h-12 w-12 text-[var(--text-muted)]" /></div>}
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${collection.is_public ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/20 text-gray-300'}`}>{collection.is_public ? 'Public' : 'Private'}</span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h2 className="line-clamp-1 font-zilla text-xl text-[var(--foreground)]">{collection.name}</h2>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-[var(--text-muted)]">{collection.description || 'No description added.'}</p>
        </div>
        <span className="inline-flex rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">{collection.property_count} {collection.property_count === 1 ? 'property' : 'properties'}</span>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
          <Link href={`/dashboard/collections/${collection.id}`} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)]"><Pencil className="h-4 w-4" />Edit</Link>
          <button type="button" onClick={share} aria-label="Copy collection link" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)]"><Copy className="h-4 w-4" />Share</button>
          {whatsappLink && <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Share collection on WhatsApp" className="inline-flex items-center rounded-md bg-[#25D366] px-3 py-2 text-sm text-white hover:bg-[#1FAF56]"><MessageCircle className="h-4 w-4" /></a>}
          <button type="button" onClick={() => onDelete(collection)} aria-label={`Delete ${collection.name}`} className="ml-auto rounded-md p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

export function CollectionDeleteDialog({ collection, onClose, onDeleted }: { collection: CollectionRecord; onClose: () => void; onDeleted: () => void }) {
  const remove = async () => {
    const response = await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Unable to delete collection');
      return;
    }
    toast.success('Collection deleted');
    onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <h2 className="font-zilla text-2xl text-[var(--foreground)]">Delete collection?</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Delete &quot;{collection.name}&quot;? Properties are not deleted.</p>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--bg-elevated)]">Cancel</button><button type="button" onClick={remove} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete</button></div>
      </div>
    </div>
  );
}
