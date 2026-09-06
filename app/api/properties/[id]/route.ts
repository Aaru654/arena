import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { PropertyImage } from '@/app/types/database';

interface UpdatePropertyRequest {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body: UpdatePropertyRequest = await request.json();
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

    // Verify ownership and update
    const { data: property, error } = await (supabase
      .from('properties') as any)
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) {
      console.error('DB error:', error);
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('PATCH /api/properties/[id] error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { tenant_id } = await request.json();

    // Fetch images first to delete from storage
    const { data: images } = await supabase
      .from('property_images')
      .select('storage_path')
      .eq('property_id', id);

    if (images && images.length > 0) {
      const paths = (images as PropertyImage[]).map(img => img.storage_path);
      await supabase.storage
        .from('property-images')
        .remove(paths);
    }

    // Delete property images from DB
    await supabase
      .from('property_images')
      .delete()
      .eq('property_id', id);

    // Delete property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant_id);

    if (error) {
      console.error('DB error:', error);
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Property deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/properties/[id] error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
