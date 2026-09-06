'use client';

import { Button } from '@/src/components/ui/button';
import { useTenant } from '@/app/lib/tenant/context';

export function PlanInfoCard() {
  const { tenant } = useTenant();
  const plan = tenant?.settings?.plan || 'Free';
  const limits = {
    Free: { properties: 10, collections: 3, members: 1 },
    Starter: { properties: 100, collections: 20, members: 5 },
    Pro: { properties: 500, collections: 100, members: 25 },
    Enterprise: { properties: -1, collections: -1, members: -1 },
  };

  const currentLimits = limits[plan as keyof typeof limits] || limits.Free;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Current Plan</h3>
          <p className="text-2xl font-zilla text-[var(--accent)]">{plan}</p>
        </div>
        <span className="text-xs bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-1 rounded-full">
          Active
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Properties</span>
          <span className="text-[var(--foreground)]">
            {currentLimits.properties === -1 ? 'Unlimited' : `${currentLimits.properties}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Collections</span>
          <span className="text-[var(--foreground)]">
            {currentLimits.collections === -1 ? 'Unlimited' : `${currentLimits.collections}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Team Members</span>
          <span className="text-[var(--foreground)]">
            {currentLimits.members === -1 ? 'Unlimited' : `${currentLimits.members}`}
          </span>
        </div>
      </div>
      {plan !== 'Enterprise' && (
        <Button variant="outline" className="w-full mt-4">
          Upgrade Plan
        </Button>
      )}
    </div>
  );
}