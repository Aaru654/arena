export interface SuperTenant {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string | null;
  branding?: { logo_url?: string | null; primary_color?: string; secondary_color?: string } | null;
  settings?: { whatsapp_number?: string; contact_email?: string; plan?: string; property_limit?: number; expires_at?: string | null } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedNumber {
  id: string;
  tenant_id: string;
  phone_number: string;
  display_name: string | null;
  role: 'owner' | 'agent' | string;
  is_active: boolean;
  created_at: string;
}

export interface VaultVideo {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
