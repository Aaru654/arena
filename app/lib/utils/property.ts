import { nanoid } from 'nanoid';
import slug from 'slugify';

/**
 * Format price with currency symbol
 * INR: >= 10Cr → "₹ X Cr" | >= 1L → "₹ X L" | else "₹ X"
 * USD: "$ X"
 * AED: "AED X"
 */
export function formatPrice(price: number | null | undefined, currency: string = 'INR'): string {
  if (!price && price !== 0) return '';

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (currency === 'INR') {
    if (price >= 10000000) {
      const crores = price / 10000000;
      return `₹ ${formatter.format(Math.round(crores * 10) / 10)} Cr`;
    } else if (price >= 100000) {
      const lakhs = price / 100000;
      return `₹ ${formatter.format(Math.round(lakhs * 10) / 10)} L`;
    } else {
      return `₹ ${formatter.format(price)}`;
    }
  } else if (currency === 'USD') {
    return `$ ${formatter.format(price)}`;
  } else if (currency === 'AED') {
    return `AED ${formatter.format(price)}`;
  }

  return formatter.format(price);
}

/**
 * Generate a URL-safe slug from title + nanoid
 * Example: "Beautiful Mumbai Home" → "beautiful-mumbai-home-a1b2"
 */
export function generatePropertySlug(title: string): string {
  const baseSlug = slug(title, { lower: true, strict: true });
  const id = nanoid(4);
  return `${baseSlug}-${id}`;
}

export function generateCollectionSlug(name: string): string {
  const baseSlug = slug(name, { lower: true, strict: true });
  const id = nanoid(4);
  return `${baseSlug}-${id}`;
}

/**
 * Get public storage URL for a property image
 * Takes storage path and constructs full Supabase URL
 */
export function getStorageUrl(storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
  }
  return `${baseUrl}/storage/v1/object/public/property-images/${storagePath}`;
}

/**
 * Format property specifications as readable string
 * Example: "3 BHK · 2 Bath · 1200 sq.ft"
 */
export function formatSpecs(
  bedrooms?: number | null,
  bathrooms?: number | null,
  areaSqft?: number | null
): string {
  const parts: string[] = [];

  if (bedrooms !== null && bedrooms !== undefined) {
    parts.push(`${bedrooms} BHK`);
  }
  if (bathrooms !== null && bathrooms !== undefined) {
    parts.push(`${bathrooms} Bath`);
  }
  if (areaSqft !== null && areaSqft !== undefined) {
    parts.push(`${areaSqft.toLocaleString('en-IN')} sq.ft`);
  }

  return parts.join(' · ');
}
