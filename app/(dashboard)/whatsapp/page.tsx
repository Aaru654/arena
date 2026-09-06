import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { AuthorizedNumbersTable, ConversationsTable, HowItWorks } from '@/src/components/whatsapp/WhatsAppTables';

export default async function WhatsappPage() {
  const { tenant } = await requireTenantAdmin();
  const supabase = await createClient();
  const [{ data: numbers }, { data: conversations }] = await Promise.all([
    (supabase.from('whatsapp_authorized_numbers') as any).select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: true }),
    (supabase.from('whatsapp_conversations') as any).select('phone_number, state, last_message_at, partial_data').eq('tenant_id', tenant.id).order('last_message_at', { ascending: false }).limit(20),
  ]);
  const settings = (tenant.settings || {}) as Record<string, unknown>;
  const whatsappNumber = String(settings.whatsapp_number || '');

  return (
    <div className="space-y-6">
      <div><h1 className="font-zilla text-3xl text-[var(--foreground)]">WhatsApp</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Manage bot access and monitor listing conversations.</p></div>
      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><div className="flex items-start gap-4"><div className="rounded-full bg-[#25D366]/15 p-3 text-[#25D366]"><MessageCircle className="h-6 w-6" /></div><div><h2 className="font-zilla text-2xl text-[var(--foreground)]">WhatsApp Bot</h2><p className="mt-1 text-sm text-[var(--text-muted)]">Your bot is active. Authorized numbers can message it to create listings.</p><p className="mt-4 text-sm text-[var(--foreground)]">{whatsappNumber ? `Connected number: ${whatsappNumber}` : 'Not configured'}</p>{!whatsappNumber && <Link href="/dashboard/settings" className="mt-3 inline-block text-sm text-[var(--accent)]">Configure WhatsApp number in Settings</Link>}</div></div></section>
      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="font-zilla text-2xl text-[var(--foreground)]">Authorized Numbers</h2><AuthorizedNumbersTable numbers={numbers || []} /></section>
      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="font-zilla text-2xl text-[var(--foreground)]">Recent Conversations</h2><ConversationsTable conversations={conversations || []} /></section>
      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="font-zilla text-2xl text-[var(--foreground)]">How it works</h2><HowItWorks /></section>
    </div>
  );
}
