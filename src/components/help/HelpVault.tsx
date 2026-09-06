'use client';

import { useMemo, useState } from 'react';
import { Tabs } from '@/src/components/ui/Tabs';
import { VideoCard } from './VideoCard';
import { HelpVideo } from './types';

const tabs = [{ label: 'All', value: 'all' }, { label: 'Properties', value: 'properties' }, { label: 'Collections', value: 'collections' }, { label: 'WhatsApp', value: 'whatsapp' }, { label: 'General', value: 'general' }];

export function HelpVault({ videos }: { videos: HelpVideo[] }) {
  const [active, setActive] = useState('all');
  const filtered = useMemo(() => active === 'all' ? videos : videos.filter((video) => video.category === active), [active, videos]);
  return <div className="space-y-6"><Tabs tabs={tabs} active={active} onChange={setActive} />{filtered.length === 0 ? <div className="rounded-lg border border-dashed border-[var(--border)] py-20 text-center"><p className="text-[var(--foreground)]">No help videos available yet.</p><p className="mt-2 text-sm text-[var(--text-muted)]">Contact support for assistance.</p></div> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((video) => <VideoCard key={video.id} video={video} />)}</div>}</div>;
}
