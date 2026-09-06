'use client';

import { usePathname } from 'next/navigation';
import { useTenant } from '@/app/lib/tenant/context';

export default function Header() {
  const pathname = usePathname();
  const { tenant } = useTenant();

  const pathPart = pathname.split('/').pop();
  const title = pathPart ? pathPart.charAt(0).toUpperCase() + pathPart.slice(1) : 'Dashboard';

  return (
    <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-[var(--foreground)] capitalize">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--accent)]">
          {tenant?.settings?.plan || 'Free'} Plan
        </span>
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] font-bold">
          {tenant?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}
