'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, FolderOpen, MessageCircle, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useTenant } from '@/app/lib/tenant/context';

const navItems = [
  { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { label: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { label: 'Collections', href: '/dashboard/collections', icon: FolderOpen },
  { label: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageCircle },
  { label: 'Help Vault', href: '/dashboard/help', icon: HelpCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tenant, profile } = useTenant();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-[var(--bg-surface)] border-r border-[var(--border)] h-full">
        <div className="p-6">
          <h2 className="font-zilla text-xl text-[var(--foreground)] truncate">{tenant?.name || 'AddBrokr'}</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <p className="text-xs text-[var(--text-muted)] truncate">{profile?.email || 'User'}</p>
          <Link href="/logout" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-red-500">
            <LogOut size={16} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border)] flex justify-around p-2 z-50">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`p-2 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
              <Icon size={24} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
