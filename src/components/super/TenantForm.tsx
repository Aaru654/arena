'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { SuperTenant } from './types';

const tenantSchema = z.object({
  name: z.string().min(2, 'Business name required'),
  subdomain: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens').refine((value) => !value.startsWith('-') && !value.endsWith('-'), 'Cannot start or end with hyphen'),
  contact_email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  whatsapp_number: z.union([z.string().regex(/^[0-9]{10,15}$/, 'Use 10-15 digits only'), z.literal('')]).optional(),
  plan: z.enum(['starter', 'pro', 'enterprise']),
  property_limit: z.coerce.number().int().min(1),
  expires_at: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex color'),
  logo_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  admin_email: z.union([z.string().email('Admin email required'), z.literal('')]).optional(),
  admin_full_name: z.string().optional(),
  admin_password: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const planDefaults = { starter: 25, pro: 100, enterprise: 500 };

export default function TenantForm({ initialData, mode, onSuccess }: { initialData?: SuperTenant; mode: 'create' | 'edit'; onSuccess?: (tenantId: string) => void }) {
  const router = useRouter();
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainError, setSubdomainError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const settings = initialData?.settings || {};
  const branding = initialData?.branding || {};
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: initialData?.name || '',
      subdomain: initialData?.subdomain || '',
      contact_email: settings.contact_email || '',
      whatsapp_number: settings.whatsapp_number || '',
      plan: (settings.plan as 'starter' | 'pro' | 'enterprise') || 'starter',
      property_limit: settings.property_limit || 25,
      expires_at: settings.expires_at || '',
      primary_color: branding.primary_color || '#22c55e',
      logo_url: branding.logo_url || '',
      admin_email: '',
      admin_full_name: '',
      admin_password: '',
    },
  });
  const plan = watch('plan');
  const subdomain = watch('subdomain');

  useEffect(() => {
    if (mode === 'create') setValue('property_limit', planDefaults[plan]);
  }, [mode, plan, setValue]);

  const checkSubdomain = async () => {
    if (mode === 'edit' && subdomain === initialData?.subdomain) return;
    if (subdomain.length < 2 || !/^[a-z0-9-]+$/.test(subdomain)) return;
    setCheckingSubdomain(true);
    try {
      const response = await fetch(`/api/super/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`);
      const result = await response.json();
      setSubdomainAvailable(result.available);
      setSubdomainError(result.available ? '' : 'Already taken');
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const submit = async (values: TenantFormValues) => {
    if (subdomainAvailable === false) return;
    if (mode === 'create' && (!values.admin_email || !values.admin_password || values.admin_password.length < 8)) {
      toast.error('Admin email and a password of at least 8 characters are required');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(mode === 'create' ? '/api/super/tenants' : `/api/super/tenants/${initialData?.id}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save tenant');
      toast.success(mode === 'create' ? 'Tenant created' : 'Tenant updated');
      if (onSuccess) onSuccess(result.tenant.id);
      else router.push(`/super-admin/tenants/${result.tenant.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save tenant');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name: keyof TenantFormValues) => errors[name]?.message as string | undefined;
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      <section className="space-y-4"><div><h2 className="font-zilla text-xl text-[var(--foreground)]">Business Info</h2><p className="text-sm text-[var(--text-muted)]">Configure the tenant identity and contact details.</p></div>
        <label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Business name</span><input {...register('name')} className="super-input" />{fieldError('name') && <span className="super-error">{fieldError('name')}</span>}</label>
        <label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Subdomain</span><div className="flex items-center"><input {...register('subdomain')} onBlur={checkSubdomain} className="super-input rounded-r-none" /><span className="rounded-r-md border border-l-0 border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-muted)]">.addbrokr.com</span></div><p className={`text-xs ${subdomainError ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>{subdomainError || (subdomain ? `${subdomain}.addbrokr.com` : 'Choose a unique lowercase subdomain')}{checkingSubdomain && ' Checking...'}</p>{fieldError('subdomain') && <span className="super-error">{fieldError('subdomain')}</span>}</label>
        <div className="grid gap-4 md:grid-cols-2"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Contact email</span><input type="email" {...register('contact_email')} className="super-input" />{fieldError('contact_email') && <span className="super-error">{fieldError('contact_email')}</span>}</label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">WhatsApp number</span><input inputMode="numeric" {...register('whatsapp_number')} className="super-input" placeholder="919876543210" />{fieldError('whatsapp_number') && <span className="super-error">{fieldError('whatsapp_number')}</span>}</label></div>
      </section>
      <section className="space-y-4"><h2 className="font-zilla text-xl text-[var(--foreground)]">Plan &amp; Limits</h2><div className="grid gap-4 md:grid-cols-3"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Plan</span><select {...register('plan')} className="super-input"><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Property limit</span><input type="number" {...register('property_limit')} className="super-input" />{fieldError('property_limit') && <span className="super-error">{fieldError('property_limit')}</span>}</label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Expiry date</span><input type="date" {...register('expires_at')} className="super-input" /></label></div></section>
      <section className="space-y-4"><h2 className="font-zilla text-xl text-[var(--foreground)]">Branding</h2><div className="grid gap-4 md:grid-cols-2"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Primary color</span><div className="flex gap-3"><input type="color" {...register('primary_color')} className="h-10 w-14 rounded border border-[var(--border)] bg-transparent" /><input {...register('primary_color')} className="super-input" /></div>{fieldError('primary_color') && <span className="super-error">{fieldError('primary_color')}</span>}</label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Logo URL</span><input {...register('logo_url')} className="super-input" placeholder="https://..." />{fieldError('logo_url') && <span className="super-error">{fieldError('logo_url')}</span>}</label></div></section>
      {mode === 'create' && <section className="space-y-4"><div><h2 className="font-zilla text-xl text-[var(--foreground)]">Admin Account</h2><p className="text-sm text-[var(--text-muted)]">An account will be created with these credentials.</p></div><div className="grid gap-4 md:grid-cols-2"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Admin email</span><input type="email" {...register('admin_email')} className="super-input" />{fieldError('admin_email') && <span className="super-error">{fieldError('admin_email')}</span>}</label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Full name</span><input {...register('admin_full_name')} className="super-input" /></label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Password</span><input type="password" {...register('admin_password')} className="super-input" />{fieldError('admin_password') && <span className="super-error">{fieldError('admin_password')}</span>}</label></div></section>}
      <div className="flex justify-end border-t border-[var(--border)] pt-6"><Button type="submit" size="lg" disabled={submitting || checkingSubdomain}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === 'create' ? 'Create Tenant' : 'Save Changes'}</Button></div>
    </form>
  );
}
