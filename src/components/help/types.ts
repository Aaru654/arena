export interface HelpVideo {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: 'properties' | 'collections' | 'whatsapp' | 'general' | string;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
