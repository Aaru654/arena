'use client';

interface TabOption { label: string; value: string }

export function Tabs({ tabs, active, onChange }: { tabs: TabOption[]; active: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${active === tab.value ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
