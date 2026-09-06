'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { HelpVideo } from './types';
import { VideoModal } from './VideoModal';

export function VideoCard({ video }: { video: HelpVideo }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
        <button type="button" onClick={() => setOpen(true)} className="group relative block aspect-video w-full bg-[var(--bg-elevated)] text-left">
          {video.thumbnail_url ? <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" /> : <div className="flex h-full items-center justify-center"><Play className="h-12 w-12 text-[var(--text-muted)]" /></div>}
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs capitalize text-white">{video.category}</span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"><span className="rounded-full bg-[var(--accent)] p-3 text-[var(--accent-foreground)]"><Play className="h-5 w-5 fill-current" /></span></span>
        </button>
        <div className="space-y-3 p-4"><h2 className="line-clamp-1 font-zilla text-xl text-[var(--foreground)]">{video.title}</h2>{video.description && <p className="line-clamp-2 min-h-10 text-sm text-[var(--text-muted)]">{video.description}</p>}<button type="button" onClick={() => setOpen(true)} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-foreground)]">Watch</button></div>
      </article>
      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </>
  );
}
