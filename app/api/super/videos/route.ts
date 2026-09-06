import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getSuperAdminContext } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';

export async function GET() {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  const { data, error } = await (service.from('help_vault_videos') as any).select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ videos: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await getSuperAdminContext())) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const service = await createServiceClient();
  try {
    const contentType = request.headers.get('content-type') || '';
    let values: Record<string, string> = {};
    let file: File | null = null;
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      values = Object.fromEntries(['title', 'description', 'video_url', 'thumbnail_url', 'category', 'tenant_id', 'is_public'].map((key) => [key, String(form.get(key) || '')]));
      const candidate = form.get('file');
      if (candidate instanceof File && candidate.size > 0) file = candidate;
    } else values = await request.json();
    if (!values.title?.trim() || (!values.video_url?.trim() && !file)) return NextResponse.json({ message: 'Title and video URL or file are required' }, { status: 400 });
    let videoUrl = values.video_url?.trim() || '';
    if (file) {
      const path = `${nanoid()}.mp4`;
      const { error: uploadError } = await service.storage.from('help-vault-videos').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || 'video/mp4', upsert: false });
      if (uploadError) throw uploadError;
      videoUrl = path;
    }
    const { data, error } = await (service.from('help_vault_videos') as any).insert({ title: values.title.trim(), description: values.description || null, video_url: videoUrl, thumbnail_url: values.thumbnail_url || null, category: values.category || 'general', tenant_id: values.tenant_id || null, is_public: values.is_public !== 'false' }).select().single();
    if (error) throw error;
    return NextResponse.json({ video: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to create video' }, { status: 500 });
  }
}
