'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PropertyUpdate {
  id: string;
  title: string;
  updated_at: string;
}

export function RealtimePropertyUpdater() {
  const [updates, setUpdates] = useState<PropertyUpdate[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('property-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          const property = payload.new as PropertyUpdate;
          setUpdates((prev) => [
            { id: property.id, title: property.title, updated_at: property.updated_at },
            ...prev,
          ].slice(0, 5));
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isVisible || updates.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 space-y-2">
      {updates.slice(0, 3).map((update) => (
        <div
          key={`${update.id}-${update.updated_at}`}
          className="bg-[var(--bg-surface)] border border-[var(--accent)] rounded-lg p-3 shadow-lg max-w-xs animate-slide-in"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--foreground)] line-clamp-1">
              {update.title}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Updated {formatDistanceToNow(new Date(update.updated_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}