'use client';

import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';

const schema = z.object({ name: z.string().min(2, 'Business name required'), whatsapp_number: z.union([z.string().regex(/^[0-9]{10,15}$/, 'Use 10-15 digits only'), z.literal('')]), contact_email: z.union([z.string().email('Enter a valid email'), z.literal('')]) });

export function BusinessProfileForm({ tenantId, initialName, subdomain, initialWhatsapp, initialEmail }: { tenantId: string; initialName: string; subdomain: string; initialWhatsapp: string; initialEmail: string }) {
  const [values, setValues] = useState({ name: initialName, whatsapp_number: initialWhatsapp, contact_email: initialEmail });
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSaving(true);
    const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, ...values }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { toast.error(result.message || 'Unable to save business profile'); return; }
    toast.success('Business profile saved');
  };
  return <form onSubmit={save} className="space-y-4"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Business name</span><input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className="super-input" /></label><div className="grid gap-4 md:grid-cols-2"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">WhatsApp number</span><input inputMode="numeric" value={values.whatsapp_number} onChange={(event) => setValues({ ...values, whatsapp_number: event.target.value })} className="super-input" placeholder="919876543210" />{values.whatsapp_number && <span className="text-xs text-[var(--text-muted)]">wa.me/{values.whatsapp_number}</span>}</label><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Contact email</span><input type="email" value={values.contact_email} onChange={(event) => setValues({ ...values, contact_email: event.target.value })} className="super-input" /></label></div><div><span className="text-sm text-[var(--foreground)]">Subdomain</span><p className="mt-2 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-muted)]">{subdomain}.addbrokr.com</p><p className="mt-1 text-xs text-[var(--text-muted)]">To change subdomain, contact support.</p></div><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Business Profile'}</Button></form>;
}
