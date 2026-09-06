'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Property type from database
interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: 'residential' | 'commercial' | 'land' | 'rental';
  status: 'draft' | 'published' | 'archived';
  price: number | null;
  price_label: string | null;
  location: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  features: string[];
}

const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  property_type: z.enum(['residential', 'commercial', 'land', 'rental']),
  status: z.enum(['draft', 'published', 'archived']),
  price: z.number().positive().optional().nullable(),
  location: z.string().optional(),
  city: z.string().optional(),
  bedrooms: z.number().int().min(0).max(20).optional().nullable(),
  bathrooms: z.number().int().min(0).max(20).optional().nullable(),
  area_sqft: z.number().positive().optional().nullable(),
  features: z.array(z.string()).default([]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Property;
  tenantId: string;
  propertyId?: string;
  onSuccess: (propertyId: string) => void;
}

const PRESET_FEATURES = [
  'Parking',
  'Pool',
  'Gym',
  'Security',
  'Lift',
  'Garden',
  'Balcony',
  'Furnished',
  'Power Backup',
  'Clubhouse',
  'Sea Facing',
];

export function PropertyForm({
  initialData,
  tenantId,
  propertyId,
  onSuccess,
}: PropertyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      property_type: initialData.property_type,
      status: initialData.status,
      price: initialData.price,
      location: initialData.location || '',
      city: initialData.city || '',
      bedrooms: initialData.bedrooms,
      bathrooms: initialData.bathrooms,
      area_sqft: initialData.area_sqft,
      features: initialData.features,
    } : {
      property_type: 'residential',
      status: 'draft',
      features: [],
      price: null,
      bedrooms: null,
      bathrooms: null,
      area_sqft: null,
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);

      const endpoint = propertyId 
        ? `/api/properties/${propertyId}`
        : '/api/properties';

      const method = propertyId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tenant_id: tenantId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save property');
      }

      const result = await response.json();
      toast.success(propertyId ? 'Property updated' : 'Property created');
      onSuccess(result.id);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFeatures = form.watch('features');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Section 1: Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Luxury 3BHK in Bandra"
            {...form.register('title')}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Description
          </label>
          <textarea
            placeholder="Describe your property..."
            rows={4}
            {...form.register('description')}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Property Type *
            </label>
            <select
              {...form.register('property_type')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Status *
            </label>
            <select
              {...form.register('status')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Price
            </label>
            <input
              type="number"
              placeholder="2500000"
              {...form.register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {form.formState.errors.price && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Currency
            </label>
            <select
              disabled
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] opacity-60 cursor-not-allowed"
            >
              <option>INR</option>
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">Currently INR only</p>
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Location</h3>
        
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Address
          </label>
          <input
            type="text"
            placeholder="Street address"
            {...form.register('location')}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              City
            </label>
            <input
              type="text"
              placeholder="Mumbai"
              {...form.register('city')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Bedrooms
            </label>
            <input
              type="number"
              min="0"
              max="20"
              {...form.register('bedrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              max="20"
              {...form.register('bathrooms', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Area (sq.ft)
            </label>
            <input
              type="number"
              min="0"
              {...form.register('area_sqft', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--bg-surface)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Features</h3>
        <p className="text-sm text-[var(--text-muted)]">Select features available in this property</p>
        
        <div className="flex flex-wrap gap-2">
          {PRESET_FEATURES.map(feature => (
            <button
              key={feature}
              type="button"
              onClick={() => {
                const current = form.getValues('features') || [];
                if (current.includes(feature)) {
                  form.setValue('features', current.filter(f => f !== feature));
                } else {
                  form.setValue('features', [...current, feature]);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedFeatures?.includes(feature)
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {propertyId ? 'Save Changes' : 'Create Property'}
        </button>
      </div>
    </form>
  );
}
