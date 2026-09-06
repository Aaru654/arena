import './landing.css';
import Nav from '@/src/components/landing/Nav';
import Hero from '@/src/components/landing/Hero';
import ProofBar from '@/src/components/landing/ProofBar';
import HowItWorks from '@/src/components/landing/HowItWorks';
import Features from '@/src/components/landing/Features';
import WhatsAppFlow from '@/src/components/landing/WhatsAppFlow';
import DashboardPreview from '@/src/components/landing/DashboardPreview';
import Benefits from '@/src/components/landing/Benefits';
import CTA from '@/src/components/landing/CTA';
import Footer from '@/src/components/landing/Footer';

export default function HomePage() {
  return <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'Aileron, sans-serif' }}><Nav /><Hero /><ProofBar /><HowItWorks /><Features /><WhatsAppFlow /><DashboardPreview /><Benefits /><CTA /><Footer /></main>;
}
