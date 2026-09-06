'use client';

export function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-3">
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 rounded border border-[var(--border)] bg-transparent" aria-label="Choose color" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="flex h-10 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]" aria-label="Hex color" />
    </div>
  );
}
