'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeletePropertyButtonProps {
  propertyId: string;
  tenantId: string;
  title: string;
}

export default function DeletePropertyButton({
  propertyId,
  tenantId,
  title,
}: DeletePropertyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      toast.success('Property deleted');
      router.push('/dashboard/properties');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-sm text-[var(--foreground)]">
          Delete <span className="font-semibold">&quot;{title}&quot;</span>? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="px-4 py-2 border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Delete Property
    </button>
  );
}
