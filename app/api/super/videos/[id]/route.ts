import { NextRequest, NextResponse } from 'next/server';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

interface RouteContext { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const service = await createServiceClient();
  const { data, error } = await (service.from('help_vault_videos') as any).update({ title: body.title, description: body.description || null, video_url: body.video_url, thumbnail_url: body.thumbnail_url || null, category: body.category || 'general', tenant_id: body.tenant_id || null, is_public: Boolean(body.is_public), updated_at: new Date().toISOString() }).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ video: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const { data: video } = await (service.from('help_vault_videos') as any).select('video_url').eq('id', params.id).maybeSingle();
  if (video?.video_url && !video.video_url.startsWith('http')) await service.storage.from('help-vault-videos').remove([video.video_url]);
  const { error } = await (service.from('help_vault_videos') as any).delete().eq('id', params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
