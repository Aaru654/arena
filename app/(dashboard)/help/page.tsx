import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { HelpVault } from '@/src/components/help/HelpVault';
import { HelpVideo } from '@/src/components/help/types';

export default async function HelpPage() {
  const { tenant } = await requireTenantAdmin();
  const supabase = await createClient();
  const { data } = await (supabase.from('help_vault_videos') as any)
    .select('*')
    .eq('is_public', true)
    .or(`tenant_id.eq.${tenant.id},tenant_id.is.null`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  return <div className="space-y-6"><div><h1 className="font-zilla text-3xl text-[var(--foreground)]">Help Vault</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Everything you need to use AddBrokr effectively.</p></div><HelpVault videos={(data || []) as HelpVideo[]} /></div>;
}
