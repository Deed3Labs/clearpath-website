import { PARTNERS, type Partner } from '@/content/directory';

/* Drafts render in `next dev`, or with DIRECTORY_SHOW_DRAFTS=true, and never
   otherwise — a stand-in must not read as a real partner on the live site. */
export function showDrafts(): boolean {
  if (process.env.DIRECTORY_SHOW_DRAFTS === 'true') return true;
  if (process.env.DIRECTORY_SHOW_DRAFTS === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

export function listedPartners(): Partner[] {
  const drafts = showDrafts();
  return PARTNERS.filter((p) => p.status === 'listed' || drafts).sort((a, b) => a.name.localeCompare(b.name));
}

export function getPartner(slug: string): Partner | undefined {
  return listedPartners().find((p) => p.slug === slug);
}

export function initials(name: string): string {
  return name
    .replace(/&/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* "2026-08" → "August 2026", by hand so server and client agree. */
export function monthYear(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
