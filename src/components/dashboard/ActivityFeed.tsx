'use client';

import { formatDistanceToNow } from 'date-fns';
import { Building2, MessageSquare, User, Check } from 'lucide-react';

interface Activity {
  id: string;
  type: 'property_created' | 'property_updated' | 'inquiry_received' | 'collection_shared';
  message: string;
  created_at: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap = {
  property_created: Building2,
  property_updated: Building2,
  inquiry_received: MessageSquare,
  collection_shared: User,
};

const colorMap = {
  property_created: 'text-green-500 bg-green-500/10',
  property_updated: 'text-blue-500 bg-blue-500/10',
  inquiry_received: 'text-yellow-500 bg-yellow-500/10',
  collection_shared: 'text-purple-500 bg-purple-500/10',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            const colorClass = colorMap[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)]">{activity.message}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}