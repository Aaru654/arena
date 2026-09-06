import { requireTenantAdmin } from '@/app/lib/auth/session';
import { createClient } from '@/app/lib/supabase/server';
import { BusinessProfileForm } from '@/src/components/settings/BusinessProfileForm';
import { BrandingForm } from '@/src/components/settings/BrandingForm';
import { AccountForm } from '@/src/components/settings/AccountForm';
import { PlanInfo } from '@/src/components/settings/PlanInfo';

export default async function SettingsPage() {
  const { tenant, profile, user } = await requireTenantAdmin();
  const supabase = await createClient();
  const { count: propertyCount } = await supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
  const settings = (tenant.settings || {}) as Record<string, unknown>;
  const branding = (tenant.branding || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-zilla text-3xl text-[var(--foreground)]">Settings</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Manage your business profile, branding, account, and plan.</p></div>
      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="mb-5 font-zilla text-2xl text-[var(--foreground)]">Business Profile</h2><BusinessProfileForm tenantId={tenant.id} initialName={tenant.name || ''} subdomain={tenant.subdomain || tenant.slug || ''} initialWhatsapp={String(settings.whatsapp_number || '')} initialEmail={String(settings.contact_email || '')} /></section>
      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="mb-5 font-zilla text-2xl text-[var(--foreground)]">Branding</h2><BrandingForm tenantId={tenant.id} initialLogoUrl={String(branding.logo_url || '')} initialPrimaryColor={String(branding.primary_color || '#22c55e')} /></section>
      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="mb-5 font-zilla text-2xl text-[var(--foreground)]">Account / Profile</h2><AccountForm userId={user.id} initialName={String(profile.full_name || '')} email={String(profile.email || user.email || '')} initialAvatarUrl={String(profile.avatar_url || '')} /></section>
      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6"><h2 className="mb-5 font-zilla text-2xl text-[var(--foreground)]">Plan Information</h2><PlanInfo plan={String(settings.plan || 'Starter')} propertyCount={propertyCount || 0} propertyLimit={Number(settings.property_limit || 50)} expiresAt={String(settings.expires_at || '')} /></section>
    </div>
  );
}
