'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { ColorInput } from '@/src/components/ui/ColorInput';

export function BrandingForm({ tenantId, initialLogoUrl, initialPrimaryColor }: { tenantId: string; initialLogoUrl: string; initialPrimaryColor: string }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor || '#22c55e');
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) { toast.error('Use a six-digit hex color'); return; }
    setSaving(true);
    const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, logo_url: logoUrl, primary_color: primaryColor }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { toast.error(result.message || 'Unable to save branding'); return; }
    toast.success('Branding saved');
  };
  return <form onSubmit={save} className="space-y-4"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Logo URL</span><input type="url" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} className="super-input" placeholder="https://..." /></label>{logoUrl && <div className="flex h-24 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3"><div role="img" aria-label="Logo preview" className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${logoUrl})` }} /></div>}<label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Primary color</span><ColorInput value={primaryColor} onChange={setPrimaryColor} /></label><div className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3"><span className="text-sm text-[var(--text-muted)]">Preview</span><button type="button" style={{ backgroundColor: primaryColor }} className="rounded-md px-4 py-2 text-sm font-medium text-black">Sample action</button></div><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Branding'}</Button></form>;
}
