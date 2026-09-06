'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <header style={{ position: 'fixed', inset: '0 0 auto', zIndex: 20, height: 56, background: scrolled ? 'rgba(10,10,10,.94)' : 'transparent', borderBottom: scrolled ? '1px solid #242424' : '1px solid transparent', backdropFilter: scrolled ? 'blur(10px)' : 'none', transition: 'background .2s, border-color .2s' }}><div style={{ maxWidth: 1180, height: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Link href="/" style={{ color: '#f5f5f5', fontFamily: 'Zilla Slab, serif', fontSize: 24 }}>AddBrokr</Link><Link href="/login" style={{ color: '#f5f5f5', border: '1px solid #333', borderRadius: 6, padding: '8px 15px', fontSize: 14 }}>Sign In</Link></div></header>;
}
