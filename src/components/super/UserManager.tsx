'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface UserRow { id: string; email: string; full_name: string | null; role: string; is_active: boolean; created_at: string }

export default function UserManager({ tenantId, initialUsers }: { tenantId: string; initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'tenant_admin' });
  const [saving, setSaving] = useState(false);
  const add = async () => {
    setSaving(true);
    const response = await fetch(`/api/super/tenants/${tenantId}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { toast.error(result.message || 'Unable to add user'); return; }
    setUsers((current) => [...current, result.profile]); setForm({ email: '', full_name: '', password: '', role: 'tenant_admin' }); setOpen(false); toast.success('User added');
  };
  const toggle = async (user: UserRow) => {
    const response = await fetch(`/api/super/tenants/${tenantId}/users`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, is_active: !user.is_active }) });
    if (!response.ok) toast.error('Unable to update user'); else setUsers((current) => current.map((item) => item.id === user.id ? { ...item, is_active: !item.is_active } : item));
  };
  return <div className="space-y-4"><div className="flex justify-end"><button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-[var(--accent-foreground)]"><Plus className="h-4 w-4" />Add User</button></div>{open && <div className="grid gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:grid-cols-4"><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="Email" className="super-input" /><input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Full name" className="super-input" /><input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Password" className="super-input" /><div className="flex gap-2"><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="super-input"><option value="tenant_admin">Admin</option><option value="viewer">Viewer</option></select><button type="button" onClick={add} disabled={saving} className="rounded-md bg-[var(--accent)] px-3 text-sm text-[var(--accent-foreground)]">Add</button></div></div>}<div className="overflow-x-auto rounded-md border border-[var(--border)]"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-muted)]"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Joined</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{users.map((user) => <tr key={user.id}><td className="px-4 py-3 text-[var(--foreground)]">{user.email}</td><td className="px-4 py-3 text-[var(--text-muted)]">{user.full_name || '-'}</td><td className="px-4 py-3 capitalize text-[var(--text-muted)]">{user.role.replace('_', ' ')}</td><td className="px-4 py-3"><button type="button" onClick={() => toggle(user)} className={`rounded-full px-2 py-1 text-xs ${user.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{user.is_active ? 'Active' : 'Inactive'}</button></td><td className="px-4 py-3 text-[var(--text-muted)]">{new Date(user.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>;
}
