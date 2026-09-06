'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';

export function AccountForm({ userId, initialName, email, initialAvatarUrl }: { userId: string; initialName: string; email: string; initialAvatarUrl: string }) {
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (fullName.trim().length < 2) { toast.error('Full name is required'); return; }
    setSaving(true);
    const response = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: userId, full_name: fullName, avatar_url: avatarUrl }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { toast.error(result.message || 'Unable to save account'); return; }
    toast.success('Account profile saved');
  };
  return <form onSubmit={save} className="space-y-4"><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Full name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} className="super-input" /></label><div><span className="text-sm text-[var(--foreground)]">Email</span><p className="mt-2 rounded-md bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-muted)]">{email}</p><p className="mt-1 text-xs text-[var(--text-muted)]">To change email, contact support.</p></div><label className="block space-y-2"><span className="text-sm text-[var(--foreground)]">Avatar URL</span><input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} className="super-input" placeholder="https://..." /></label><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Account'}</Button></form>;
}
