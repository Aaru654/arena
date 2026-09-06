export interface CollectionImage {
  storage_path: string;
  is_primary?: boolean | null;
  is_cover?: boolean | null;
  sort_order?: number | null;
  display_order?: number | null;
}

export interface CollectionProperty {
  id: string;
  title: string;
  city: string | null;
  address?: string | null;
  location?: string | null;
  price: number | null;
  currency?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqft?: number | null;
  property_images?: CollectionImage[];
}

export interface CollectionRecord {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_path: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  properties?: CollectionProperty[];
}
