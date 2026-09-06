import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';

interface RouteContext {
  params: { id: string };
}

async function getOwnedCollection(id: string, tenantId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from('collections') as any).select('*').eq('id', id).eq('tenant_id', tenantId).maybeSingle();
  return { data, error };
}

async function replaceProperties(collectionId: string, tenantId: string, propertyIds: string[]) {
  const supabase = await createClient();
  if (propertyIds.length > 0) {
    const { data: properties, error: propertyError } = await (supabase.from('properties') as any).select('id').eq('tenant_id', tenantId).in('id', propertyIds);
    if (propertyError || (properties?.length || 0) !== new Set(propertyIds).size) throw new Error('One or more properties are not owned by this tenant');
  }
  const { error: deleteError } = await (supabase.from('collection_properties') as any).delete().eq('collection_id', collectionId);
  if (deleteError) throw deleteError;
  if (propertyIds.length === 0) return;
  const { error } = await (supabase.from('collection_properties') as any).insert(propertyIds.map((propertyId, index) => ({ collection_id: collectionId, property_id: propertyId, sort_order: index })));
  if (error) throw error;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { tenant } = await requireTenantAdmin();
    const existing = await getOwnedCollection(params.id, tenant.id);
    if (existing.error) throw existing.error;
    if (!existing.data) return NextResponse.json({ message: 'Collection not found' }, { status: 404 });

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2) return NextResponse.json({ message: 'Name required' }, { status: 400 });
      updates.name = name;
    }
    if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
    if (body.is_public !== undefined) updates.is_public = Boolean(body.is_public);

    const supabase = await createClient();
    if (Object.keys(updates).length > 0) {
      const { error } = await (supabase.from('collections') as any).update(updates).eq('id', params.id).eq('tenant_id', tenant.id);
      if (error) throw error;
    }
    if (Array.isArray(body.propertyIds)) await replaceProperties(params.id, tenant.id, body.propertyIds.filter((id: unknown): id is string => typeof id === 'string'));

    const { data: collection, error } = await getOwnedCollection(params.id, tenant.id);
    if (error) throw error;
    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Update collection error:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to update collection' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { tenant } = await requireTenantAdmin();
    const existing = await getOwnedCollection(params.id, tenant.id);
    if (existing.error) throw existing.error;
    if (!existing.data) return NextResponse.json({ message: 'Collection not found' }, { status: 404 });

    const supabase = await createClient();
    const { error: relationError } = await (supabase.from('collection_properties') as any).delete().eq('collection_id', params.id);
    if (relationError) throw relationError;
    const { error } = await (supabase.from('collections') as any).delete().eq('id', params.id).eq('tenant_id', tenant.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to delete collection' }, { status: 500 });
  }
}
