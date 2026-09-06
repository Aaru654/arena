'use client';

import { ReactNode, useState } from 'react';

export default function TenantTabs({ details, users, properties, whatsapp }: { details: ReactNode; users: ReactNode; properties: ReactNode; whatsapp: ReactNode }) {
  const [active, setActive] = useState('details');
  const tabs = { details, users, properties, whatsapp };
  return <div className="space-y-6"><div className="flex flex-wrap gap-1 border-b border-[var(--border)]">{Object.keys(tabs).map((tab) => <button type="button" key={tab} onClick={() => setActive(tab)} className={`border-b-2 px-4 py-3 text-sm capitalize ${active === tab ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)]'}`}>{tab === 'whatsapp' ? 'WhatsApp Numbers' : tab}</button>)}</div><div>{tabs[active as keyof typeof tabs]}</div></div>;
}
