'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteCollectionButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const response = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Unable to delete collection');
      setDeleting(false);
      return;
    }
    toast.success('Collection deleted');
    router.push('/dashboard/collections');
  };

  if (!confirming) return <button type="button" onClick={() => setConfirming(true)} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Delete Collection</button>;

  return <div className="flex flex-wrap items-center gap-3"><p className="text-sm text-red-400">Delete &quot;{name}&quot;? Properties are not deleted.</p><button type="button" onClick={() => setConfirming(false)} className="rounded-md px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--bg-elevated)]">Cancel</button><button type="button" onClick={remove} disabled={deleting} className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50">{deleting ? 'Deleting...' : 'Confirm Delete'}</button></div>;
}
