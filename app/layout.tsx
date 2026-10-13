import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeaderInk } from '@/components/layout/HeaderInk';
import { DebugGrid } from '@/components/dev/DebugGrid';
import { HERO } from '@/content/home';
import './globals.css';
import './styles/system.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  display: 'swap',
  variable: '--font-bricolage',
});

const text = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
});

/* IBM Plex Mono ships no 450; 400/500 is the nearest pair. */
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://useclear.org'),
  title: {
    default: 'Clear — a member-owned cooperative',
    template: '%s · Clear',
  },
  /* The hero's own subline, so the page and every link preview say the same
     thing. og:description and twitter:description fall back to this one. */
  description: HERO.lede,
  /* opengraph-image.tsx and the icon files under app/ are picked up by
     convention; only the parts Next cannot infer are declared here. */
  openGraph: {
    type: 'website',
    siteName: 'Clear',
    locale: 'en_US',
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
};

/* First paint. When motion is allowed, `motion` on <html> lets CSS hold the
   hero at its start state until its intro takes over (HeroScope), so the h1
   never flashes finished and then drops back into its masks. If the intro has
   not started three seconds in, the class comes off and the hero shows as
   rendered. No JS, or reduced motion: the class is never set. */
const MOTION_GATE = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('motion');setTimeout(function(){if(!document.querySelector('.hero[data-intro]'))d.classList.remove('motion')},3000)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      </head>
      {/* ScrollTrigger touches <body>'s style attribute when it registers, which
          happens while the page hydrates; the empty attribute it leaves is not
          a real mismatch. */}
      <body suppressHydrationWarning>
        <Header />
        <HeaderInk />
        <main>{children}</main>
        <Footer />
        <GlowDefs />
        <DebugGrid />
      </body>
    </html>
  );
}

/* The soft blur every trace's halo uses (lib/anim/trace.ts), defined once. */
function GlowDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
    </svg>
  );
}
