'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { nanoid } from 'nanoid';
import { Loader2, X, Star, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/app/lib/supabase/client';
import { getStorageUrl } from '@/app/lib/utils/property';
import Image from 'next/image';

interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  display_order: number;
  is_cover: boolean;
}

interface ImageUploaderProps {
  propertyId: string;
  tenantId: string;
  existingImages: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

export function ImageUploader({
  propertyId,
  tenantId,
  existingImages,
  onImagesChange,
}: ImageUploaderProps) {
  const [images, setImages] = useState<PropertyImage[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= 20) {
        toast.error('Maximum 20 images reached');
        return;
      }

      if (images.length + acceptedFiles.length > 20) {
        toast.error(`Can only add ${20 - images.length} more images`);
        return;
      }

      setIsUploading(true);

      try {
        for (const file of acceptedFiles) {
          try {
            // Compress image
            const options = {
              maxSizeMB: 0.3,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            // Generate storage path
            const filename = `${nanoid()}.webp`;
            const storagePath = `${tenantId}/${propertyId}/${filename}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(storagePath, compressedFile, {
                contentType: 'image/webp',
                upsert: false,
              });

            if (uploadError) {
              throw uploadError;
            }

            // Insert into database
            const newImage = {
              id: nanoid(),
              property_id: propertyId,
              tenant_id: tenantId,
              storage_path: storagePath,
              display_order: images.length,
              is_cover: images.length === 0, // First image is primary
              created_at: new Date().toISOString(),
            };

            const { error: dbError } = await supabase
              .from('property_images')
              .insert([newImage] as any);

            if (dbError) {
              throw dbError;
            }

            setImages(prev => [...prev, newImage]);
          } catch (err) {
            console.error('Error uploading image:', err);
            toast.error(`Failed to upload ${file.name}`);
          }
        }

        toast.success('Images uploaded successfully');
      } finally {
        setIsUploading(false);
      }
    },
    [images, propertyId, tenantId, supabase]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    disabled: isUploading || images.length >= 20,
  });

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Update all images to not be primary
      const { error: resetError } = await (supabase
        .from('property_images') as any)
        .update({ is_cover: false })
        .eq('property_id', propertyId);

      if (resetError) throw resetError;

      // Set selected image as primary
      const { error: updateError } = await (supabase
        .from('property_images') as any)
        .update({ is_cover: true })
        .eq('id', imageId);

      if (updateError) throw updateError;

      // Update local state
      setImages(prev =>
        prev.map(img => ({
          ...img,
          is_cover: img.id === imageId,
        }))
      );

      toast.success('Primary image updated');
    } catch (error) {
      console.error('Error updating primary image:', error);
      toast.error('Failed to update primary image');
    }
  };

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange(updatedImages);

      toast.success('Image deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleReorder = async (imageId: string, newOrder: number) => {
    try {
      // Reorder locally first
      const imagesCopy = [...images];
      const fromIndex = imagesCopy.findIndex(img => img.id === imageId);
      if (fromIndex === -1) return;

      const [movedImage] = imagesCopy.splice(fromIndex, 1);
      imagesCopy.splice(newOrder, 0, movedImage);

      const reorderedImages = imagesCopy.map((img, idx) => ({
        ...img,
        display_order: idx,
      }));

      setImages(reorderedImages);
      onImagesChange(reorderedImages);

      // Update in database
      const updates = reorderedImages.map(img => ({
        id: img.id,
        display_order: img.display_order,
      }));

      for (const update of updates) {
        const { error } = await (supabase
          .from('property_images') as any)
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Images reordered');
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Failed to reorder images');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Images</h3>
        {images.length > 0 && (
          <span className="text-sm text-[var(--text-muted)]">
            {images.length} / 20
          </span>
        )}
      </div>

      {images.length >= 20 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Maximum 20 images reached
          </p>
        </div>
      )}

      {/* Dropzone */}
      {images.length < 20 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-[var(--accent)] bg-[var(--accent)]/5'
              : 'border-[var(--border)] hover:border-[var(--accent)]'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm text-[var(--text-muted)]">Uploading...</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Drag images here or click to select
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Max 20 images, up to 300KB each (auto-compressed to WebP)
              </p>
            </>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.display_order - b.display_order)
            .map((image, idx) => (
              <div
                key={image.id}
                className="relative group bg-[var(--bg-elevated)] rounded-lg overflow-hidden border border-[var(--border)]"
              >
                <div className="aspect-square relative">
                  <Image
                    src={getStorageUrl(image.storage_path)}
                    alt="Property"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Primary Badge */}
                {image.is_cover && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!image.is_cover && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleDeleteImage(image.id, image.storage_path)
                    }
                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                    title="Delete image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {/* Move buttons */}
                  <div className="flex gap-1 text-xs text-white/70">
                    {idx > 0 && (
                      <button
                        onClick={() => handleReorder(image.id, idx - 1)}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
                      >
                        ↑
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        onClick={() => handleReorder(image.id, idx + 1)}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>

                {/* Order number */}
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {idx + 1}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
