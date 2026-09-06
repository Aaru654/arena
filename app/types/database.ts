export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          primary_color: string | null;
          whatsapp_number: string | null;
          contact_email: string | null;
          plan_name: string;
          plan_limits: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          logo_url?: string | null;
          primary_color?: string | null;
          whatsapp_number?: string | null;
          contact_email?: string | null;
          plan_name?: string;
          plan_limits?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          whatsapp_number?: string | null;
          contact_email?: string | null;
          plan_name?: string;
          plan_limits?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          role: 'super_admin' | 'tenant_admin' | 'viewer';
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          role?: 'super_admin' | 'tenant_admin' | 'viewer';
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          role?: 'super_admin' | 'tenant_admin' | 'viewer';
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          tenant_id: string;
          slug: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          slug: string;
          title: string;
          description?: string | null;
          property_type?: 'residential' | 'commercial' | 'land' | 'rental';
          status?: 'draft' | 'published' | 'archived';
          price?: number | null;
          price_label?: string | null;
          location?: string | null;
          city?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqft?: number | null;
          features?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          property_type?: 'residential' | 'commercial' | 'land' | 'rental';
          status?: 'draft' | 'published' | 'archived';
          price?: number | null;
          price_label?: string | null;
          location?: string | null;
          city?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqft?: number | null;
          features?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          storage_path: string;
          display_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          storage_path: string;
          display_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_id?: string;
          storage_path?: string;
          display_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          tenant_id: string;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_properties: {
        Row: {
          id: string;
          collection_id: string;
          property_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          property_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          property_id?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      help_vault_videos: {
        Row: {
          id: string;
          tenant_id: string | null;
          title: string;
          description: string | null;
          video_path: string;
          thumbnail_path: string | null;
          category: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          title: string;
          description?: string | null;
          video_path: string;
          thumbnail_path?: string | null;
          category: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          title?: string;
          description?: string | null;
          video_path?: string;
          thumbnail_path?: string | null;
          category?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      whatsapp_conversations: {
        Row: {
          id: string;
          tenant_id: string;
          phone_number: string;
          state: string;
          partial_data: Json;
          property_id: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          phone_number: string;
          state?: string;
          partial_data?: Json;
          property_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          phone_number?: string;
          state?: string;
          partial_data?: Json;
          property_id?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
      };
      whatsapp_authorized_numbers: {
        Row: {
          id: string;
          tenant_id: string;
          phone_number: string;
          display_name: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          phone_number: string;
          display_name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          phone_number?: string;
          display_name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'super_admin' | 'tenant_admin' | 'viewer';
      property_type: 'residential' | 'commercial' | 'land' | 'rental';
      property_status: 'draft' | 'published' | 'archived';
    };
  };
}

export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyImage = Database['public']['Tables']['property_images']['Row'];
export type Collection = Database['public']['Tables']['collections']['Row'];
export type CollectionProperty = Database['public']['Tables']['collection_properties']['Row'];
export type HelpVaultVideo = Database['public']['Tables']['help_vault_videos']['Row'];
export type WhatsappConversation = Database['public']['Tables']['whatsapp_conversations']['Row'];
export type WhatsappAuthorizedNumber = Database['public']['Tables']['whatsapp_authorized_numbers']['Row'];

// Extended types for joined queries
export type PropertyWithImages = Property & {
  property_images: PropertyImage[];
};

export type PropertyWithTenantAndImages = Property & {
  tenants: Tenant;
  property_images: PropertyImage[];
};