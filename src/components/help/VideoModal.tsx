'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { HelpVideo } from './types';

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function youtubeEmbedUrl(url: string) {
  if (url.includes('/embed/')) return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

export function VideoModal({ video, onClose }: { video: HelpVideo; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('button, [href], video');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="video-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close video" className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"><X className="h-5 w-5" /></button>
        <div className="aspect-video overflow-hidden rounded bg-black">
          {isYouTubeUrl(video.video_url) ? <iframe src={youtubeEmbedUrl(video.video_url)} title={video.title} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen /> : <video controls autoPlay className="h-full w-full" src={video.video_url}><track kind="captions" /></video>}
        </div>
        <h2 id="video-modal-title" className="mt-5 font-zilla text-2xl text-[var(--foreground)]">{video.title}</h2>
        {video.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">{video.description}</p>}
      </div>
    </div>
  );
}
