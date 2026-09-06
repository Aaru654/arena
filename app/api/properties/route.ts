import { createClient } from '@/app/lib/supabase/server';
import { generatePropertySlug } from '@/app/lib/utils/property';
import { NextRequest, NextResponse } from 'next/server';

interface CreatePropertyRequest {
  tenant_id: string;
  title: string;
  description?: string | null;
  property_type: 'residential' | 'commercial' | 'land' | 'rental';
  status: 'draft' | 'published' | 'archived';
  price?: number | null;
  location?: string | null;
  city?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqft?: number | null;
  features?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePropertyRequest = await request.json();
    const {
      tenant_id,
      title,
      description,
      property_type,
      status,
      price,
      location,
      city,
      bedrooms,
      bathrooms,
      area_sqft,
      features = [],
    } = body;

    // Generate slug
    const slug = generatePropertySlug(title);

    // Insert property
    const { data: property, error } = await supabase
      .from('properties')
      .insert([
        {
          tenant_id,
          slug,
          title,
          description: description || null,
          property_type,
          status,
          price: price || null,
          location: location || null,
          city: city || null,
          bedrooms: bedrooms || null,
          bathrooms: bathrooms || null,
          area_sqft: area_sqft || null,
          features,
        },
      ] as any)
      .select()
      .single();

    if (error) {
      console.error('DB error:', error);
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('POST /api/properties error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
