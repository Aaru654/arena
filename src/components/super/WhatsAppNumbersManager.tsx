'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthorizedNumber } from './types';

export default function WhatsAppNumbersManager({ tenantId, initialNumbers }: { tenantId: string; initialNumbers: AuthorizedNumber[] }) {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [form, setForm] = useState({ phone_number: '', display_name: '', role: 'owner' });
  const add = async () => {
    const response = await fetch(`/api/super/tenants/${tenantId}/numbers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { toast.error(result.message || 'Unable to add number'); return; }
    setNumbers((current) => [result.number, ...current]); setForm({ phone_number: '', display_name: '', role: 'owner' }); toast.success('Number added');
  };
  const toggle = async (number: AuthorizedNumber) => {
    const response = await fetch(`/api/super/tenants/${tenantId}/numbers`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: number.id, is_active: !number.is_active }) });
    if (!response.ok) toast.error('Unable to update number'); else setNumbers((current) => current.map((item) => item.id === number.id ? { ...item, is_active: !item.is_active } : item));
  };
  const remove = async (number: AuthorizedNumber) => {
    if (!window.confirm(`Delete ${number.phone_number}?`)) return;
    const response = await fetch(`/api/super/tenants/${tenantId}/numbers?id=${number.id}`, { method: 'DELETE' });
    if (!response.ok) toast.error('Unable to delete number'); else { setNumbers((current) => current.filter((item) => item.id !== number.id)); toast.success('Number deleted'); }
  };
  return <div className="space-y-4"><div className="grid gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 md:grid-cols-4"><input inputMode="numeric" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} placeholder="Phone number" className="super-input" /><input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} placeholder="Display name" className="super-input" /><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="super-input"><option value="owner">Owner</option><option value="agent">Agent</option></select><button type="button" onClick={add} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-[var(--accent-foreground)]">Add Number</button></div><div className="overflow-x-auto rounded-md border border-[var(--border)]"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-muted)]"><tr><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Display name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Added</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-[var(--border)]">{numbers.map((number) => <tr key={number.id}><td className="px-4 py-3 text-[var(--foreground)]">{number.phone_number}</td><td className="px-4 py-3 text-[var(--text-muted)]">{number.display_name || '-'}</td><td className="px-4 py-3 capitalize text-[var(--text-muted)]">{number.role}</td><td className="px-4 py-3"><button type="button" onClick={() => toggle(number)} className={`rounded-full px-2 py-1 text-xs ${number.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{number.is_active ? 'Active' : 'Inactive'}</button></td><td className="px-4 py-3 text-[var(--text-muted)]">{new Date(number.created_at).toLocaleDateString()}</td><td className="px-4 py-3"><button type="button" onClick={() => remove(number)} aria-label={`Delete ${number.phone_number}`} className="text-[var(--text-muted)] hover:text-red-400"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></div>;
}
