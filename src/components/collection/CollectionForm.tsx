'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { GripVertical, ImageIcon, Loader2, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { getStorageUrl, formatPrice } from '@/app/lib/utils/property';
import { Button } from '@/src/components/ui/button';
import { CollectionProperty, CollectionRecord } from './types';

const collectionSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  initialData?: CollectionRecord;
  tenantId: string;
  allProperties: CollectionProperty[];
  onSuccess?: (collectionId: string) => void;
}

function getPrimaryImage(property: CollectionProperty) {
  return property.property_images?.find((image) => image.is_primary || image.is_cover)
    || property.property_images?.[0];
}

function SortableSelectedProperty({
  property,
  onRemove,
}: {
  property: CollectionProperty;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: property.id });
  const image = getPrimaryImage(property);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
    >
      <button type="button" aria-label={`Reorder ${property.title}`} className="cursor-grab text-[var(--text-muted)]" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-[var(--bg-surface)]">
        {image ? <Image src={getStorageUrl(image.storage_path)} alt="" fill className="object-cover" sizes="64px" /> : <ImageIcon className="m-3 h-6 w-6 text-[var(--text-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{property.title}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{property.city || property.address || property.location || 'No location'}</p>
      </div>
      <button type="button" aria-label={`Remove ${property.title}`} onClick={onRemove} className="text-[var(--text-muted)] hover:text-red-500">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

export function CollectionForm({ initialData, tenantId, allProperties, onSuccess }: CollectionFormProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [selectedIds, setSelectedIds] = useState<string[]>(initialData?.properties?.map((property) => property.id) || []);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      is_public: initialData?.is_public || false,
    },
  });
  const isPublic = watch('is_public');

  const propertyMap = useMemo(() => new Map(allProperties.map((property) => [property.id, property])), [allProperties]);
  const selectedProperties = selectedIds.map((id) => propertyMap.get(id)).filter(Boolean) as CollectionProperty[];
  const filteredProperties = allProperties.filter((property) => {
    const haystack = `${property.title} ${property.city || ''} ${property.address || ''} ${property.location || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const toggleProperty = (propertyId: string) => {
    setSelectedIds((current) => current.includes(propertyId)
      ? current.filter((id) => id !== propertyId)
      : [...current, propertyId]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setSelectedIds((current) => {
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const submit = async (values: CollectionFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch(initialData ? `/api/collections/${initialData.id}` : '/api/collections', {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, tenantId, propertyIds: selectedIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save collection');
      toast.success(initialData ? 'Collection updated' : 'Collection created');
      if (onSuccess) onSuccess(result.collection.id);
      else router.push(`/dashboard/collections/${result.collection.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-zilla text-[var(--foreground)]">Details</h2>
          <p className="text-sm text-[var(--text-muted)]">Give this group a clear name and choose who can view it.</p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Name</span>
          <input {...register('name')} className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" placeholder="e.g. Premium Mumbai Homes" />
          {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--foreground)]">Description</span>
          <textarea {...register('description')} rows={4} className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" placeholder="Add context for buyers viewing this collection" />
        </label>
        <button type="button" onClick={() => setValue('is_public', !isPublic)} className="flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-left">
          <span>
            <span className="block text-sm font-medium text-[var(--foreground)]">{isPublic ? 'Public' : 'Private'}</span>
            <span className="block text-xs text-[var(--text-muted)]">{isPublic ? 'Anyone with the link can view this collection.' : 'The collection is hidden from public visitors.'}</span>
          </span>
          <span className={`relative h-6 w-11 rounded-full transition-colors ${isPublic ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
          </span>
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-zilla text-[var(--foreground)]">Select Properties</h2>
            <p className="text-sm text-[var(--text-muted)]">{selectedIds.length} {selectedIds.length === 1 ? 'property' : 'properties'} selected</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]" placeholder="Search properties" />
          </div>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-[var(--border)] p-3">
          {filteredProperties.length === 0 && <p className="p-4 text-sm text-[var(--text-muted)]">No properties found.</p>}
          {filteredProperties.map((property) => {
            const image = getPrimaryImage(property);
            const selected = selectedIds.includes(property.id);
            return (
              <button type="button" key={property.id} onClick={() => toggleProperty(property.id)} className={`flex w-full items-center gap-3 rounded-md p-2 text-left ${selected ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--bg-elevated)]'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-[var(--border)]'}`}>{selected ? '✓' : ''}</span>
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-[var(--bg-elevated)]">
                  {image ? <Image src={getStorageUrl(image.storage_path)} alt="" fill className="object-cover" sizes="64px" /> : <ImageIcon className="m-3 h-6 w-6 text-[var(--text-muted)]" />}
                </div>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--foreground)]">{property.title}</span><span className="block truncate text-xs text-[var(--text-muted)]">{property.city || property.address || property.location || 'No location'}</span></span>
                <span className="text-xs text-[var(--accent)]">{formatPrice(property.price, property.currency || 'INR')}</span>
              </button>
            );
          })}
        </div>
        {selectedProperties.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">{selectedProperties.map((property) => <SortableSelectedProperty key={property.id} property={property} onRemove={() => toggleProperty(property.id)} />)}</ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <div className="flex justify-end border-t border-[var(--border)] pt-6">
        <Button type="submit" size="lg" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{initialData ? 'Save Collection' : 'Create Collection'}</Button>
      </div>
    </form>
  );
}
