'use client';

import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={clsx('bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
        <Icon className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-[var(--foreground)]">{value}</span>
        {trend && (
          <span
            className={clsx(
              'text-sm font-medium',
              trend.positive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}