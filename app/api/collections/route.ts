import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { generateCollectionSlug } from '@/app/lib/utils/property';

async function verifyPropertyIds(propertyIds: string[], tenantId: string) {
  if (propertyIds.length === 0) return true;
  const supabase = await createClient();
  const { data, error } = await (supabase.from('properties') as any)
    .select('id')
    .eq('tenant_id', tenantId)
    .in('id', propertyIds);
  return !error && (data?.length || 0) === new Set(propertyIds).size;
}

export async function POST(request: NextRequest) {
  try {
    const { tenant } = await requireTenantAdmin();
    const body = await request.json();
    const name = String(body.name || '').trim();
    const description = body.description ? String(body.description).trim() : null;
    const isPublic = Boolean(body.is_public);
    const propertyIds: string[] = Array.isArray(body.propertyIds) ? body.propertyIds.filter((id: unknown): id is string => typeof id === 'string') : [];

    if (name.length < 2) return NextResponse.json({ message: 'Name required' }, { status: 400 });
    if (!(await verifyPropertyIds(propertyIds, tenant.id))) return NextResponse.json({ message: 'One or more properties are not owned by this tenant' }, { status: 400 });

    const supabase = await createClient();
    const { data: collection, error } = await (supabase.from('collections') as any)
      .insert({ tenant_id: tenant.id, name, description, slug: generateCollectionSlug(name), is_public: isPublic, sort_order: 0 })
      .select()
      .single();
    if (error) throw error;

    if (propertyIds.length > 0) {
      const { error: relationError } = await (supabase.from('collection_properties') as any).insert(
        propertyIds.map((propertyId: string, index: number) => ({ collection_id: collection.id, property_id: propertyId, sort_order: index }))
      );
      if (relationError) {
        await (supabase.from('collections') as any).delete().eq('id', collection.id).eq('tenant_id', tenant.id);
        throw relationError;
      }
    }

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create collection' }, { status: 500 });
  }
}
