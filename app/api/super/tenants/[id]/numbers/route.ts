import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

interface RouteContext { params: { id: string } }
const phonePattern = /^[0-9]{10,15}$/;

export async function GET(_request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const { data, error } = await (service.from('whatsapp_authorized_numbers') as any).select('*').eq('tenant_id', params.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ numbers: data || [] });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  try {
    const body = await request.json();
    const phoneNumber = String(body.phone_number || '');
    if (!phonePattern.test(phoneNumber)) return NextResponse.json({ message: 'Phone number must contain 10-15 digits' }, { status: 400 });
    const role = body.role === 'agent' ? 'agent' : 'owner';
    const { data, error } = await (service.from('whatsapp_authorized_numbers') as any).insert({ tenant_id: params.id, phone_number: phoneNumber, display_name: body.display_name ? String(body.display_name) : null, role, is_active: true }).select().single();
    if (error) throw error;
    return NextResponse.json({ number: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to add number' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const body = await request.json();
  const { data, error } = await (service.from('whatsapp_authorized_numbers') as any).update({ is_active: Boolean(body.is_active) }).eq('id', body.id).eq('tenant_id', params.id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ number: data });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'Number id required' }, { status: 400 });
  const { error } = await (service.from('whatsapp_authorized_numbers') as any).delete().eq('id', id).eq('tenant_id', params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
