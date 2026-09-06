import { requireSuperAdmin } from '@/app/lib/auth/session';
import { createServiceClient } from '@/app/lib/supabase/server';
import VideoVault from '@/src/components/super/VideoVault';
import { SuperTenant, VaultVideo } from '@/src/components/super/types';

export default async function SuperAdminVideosPage() {
  await requireSuperAdmin();
  const service = await createServiceClient();
  const [{ data: videos }, { data: tenants }] = await Promise.all([
    (service.from('help_vault_videos') as any).select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    (service.from('tenants') as any).select('*').order('name', { ascending: true }),
  ]);
  return <div className="space-y-6"><div><h1 className="font-zilla text-3xl">Video Vault</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Manage global and tenant-specific help videos.</p></div><VideoVault initialVideos={(videos || []) as VaultVideo[]} tenants={(tenants || []) as SuperTenant[]} /></div>;
}
