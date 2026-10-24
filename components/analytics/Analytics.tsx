'use client';

import { useEffect } from 'react';

/* Plausible on useclear.org, for the Clear Command Center's Growth page,
   which reads the numbers back through Plausible's Stats API.

   The site's own snippet, set in NEXT_PUBLIC_PLAUSIBLE_SCRIPT (its
   pa-….js id, or the whole URL), from the useclear.org site in the Plausible
   dashboard. Nothing loads without it, and nothing loads anywhere but the
   live site, so previews and local dev never count.

   Every event leaves without its hash and with only its utm_ parameters: a
   poster's QR says utm_source=poster, which is how Growth tells poster
   visits apart, and nothing else in an address is the analytics' business. */

type Payload = { u?: string } & Record<string, unknown>;
type PlausibleFn = ((event: string, opts?: { props?: Record<string, string> }) => void) & { q?: unknown[]; o?: unknown; init?: (o?: unknown) => void };

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

const LIVE_HOSTS = ['www.useclear.org', 'useclear.org'];

export function scriptSrc(setting: string | undefined): string | null {
  const v = setting?.trim();
  if (!v) return null;
  if (/^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/.test(v)) return v;
  if (/^pa-[A-Za-z0-9_-]+(\.js)?$/.test(v)) return `https://plausible.io/js/${v.replace(/\.js$/, '')}.js`;
  return null;
}

/* The address as it's counted: no hash, and only the utm_ parameters. */
export function cleanUrl(u: string): string {
  try {
    const url = new URL(u);
    url.hash = '';
    for (const k of [...url.searchParams.keys()]) if (!k.startsWith('utm_')) url.searchParams.delete(k);
    return url.toString();
  } catch {
    return u;
  }
}

export function Analytics() {
  useEffect(() => {
    const src = scriptSrc(process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT);
    if (!src || !LIVE_HOSTS.includes(window.location.hostname) || document.querySelector(`script[src="${src}"]`)) return;
    /* Plausible's own queue: calls made before the script arrives are kept, not lost. */
    const p: PlausibleFn = window.plausible || (((...args: unknown[]) => void (p.q = p.q || []).push(args)) as PlausibleFn);
    p.init = p.init || ((o?: unknown) => void (p.o = o || {}));
    window.plausible = p;
    p.init({ transformRequest: (payload: Payload) => (typeof payload.u === 'string' ? { ...payload, u: cleanUrl(payload.u) } : payload) });
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* A goal, if Plausible is there: the join form calls it once the API has kept the answer. */
export function track(event: string, props?: Record<string, string>): void {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* analytics never gets in the way of the page */
  }
}
