'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStorageUrl } from '@/app/lib/utils/property';

interface PropertyImageType {
  id: string;
  storage_path: string;
  is_cover: boolean;
}

interface PropertyGalleryProps {
  images: PropertyImageType[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const selectedImage = images[selectedIndex];
  const nextIndex = (selectedIndex + 1) % images.length;
  const prevIndex = (selectedIndex - 1 + images.length) % images.length;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full bg-[var(--bg-elevated)] rounded-lg overflow-hidden">
        <div className="aspect-video relative">
          <Image
            src={getStorageUrl(selectedImage.storage_path)}
            alt="Property"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prevIndex)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSelectedIndex(nextIndex)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails - horizontal scroll */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedIndex === index
                  ? 'border-[var(--accent)]'
                  : 'border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <Image
                src={getStorageUrl(image.storage_path)}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
