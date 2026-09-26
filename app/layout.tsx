import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DebugGrid } from '@/components/dev/DebugGrid';
import { HERO } from '@/content/home';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <DebugGrid />
      </body>
    </html>
  );
}
