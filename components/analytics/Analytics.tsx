'use client';

import { useEffect } from 'react';

/* Umami on useclear.org, for the Clear Command Center's Growth page, which
   reads the numbers back through Umami's API. Umami is self-hosted, open
   source and cookie-free.

   The tracker's address goes in NEXT_PUBLIC_UMAMI_SRC (https://…/script.js on
   the co-op's own Umami) and the site's id in NEXT_PUBLIC_UMAMI_WEBSITE_ID,
   both from the useclear.org website in Umami's settings. Nothing loads
   without them, and nothing loads anywhere but the live site, so previews and
   local dev never count.

   Every event leaves without its hash and with only its utm_ parameters: a
   poster's QR says utm_source=poster, which is how Growth tells poster
   visits apart, and nothing else in an address is the analytics' business. */

type Payload = { url?: string; referrer?: string } & Record<string, unknown>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
    clearUmamiBeforeSend?: (type: string, payload: Payload) => Payload;
  }
}

const LIVE_HOSTS = ['www.useclear.org', 'useclear.org'];
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* The tracker, only from an https address ending in .js, and the site's id, only as a uuid. */
export function tracker(src: string | undefined, id: string | undefined): { src: string; id: string } | null {
  const s = src?.trim(),
    i = id?.trim();
  if (!s || !i || !ID.test(i)) return null;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' && !u.search && !u.hash && u.pathname.endsWith('.js') ? { src: u.toString(), id: i } : null;
  } catch {
    return null;
  }
}

/* The address as it's counted: no hash, and only the utm_ parameters. A path stays a path. */
export function cleanUrl(u: string): string {
  if (!u) return u;
  try {
    const relative = !/^[a-z][a-z0-9+.-]*:/i.test(u);
    const url = new URL(u, 'https://www.useclear.org');
    url.hash = '';
    for (const k of [...url.searchParams.keys()]) if (!k.startsWith('utm_')) url.searchParams.delete(k);
    return relative ? url.pathname + url.search : url.toString();
  } catch {
    return u;
  }
}

/* Each event, cleaned before it leaves: the page's address and the one it came from. */
export function beforeSend(_type: string, payload: Payload): Payload {
  return {
    ...payload,
    ...(typeof payload.url === 'string' ? { url: cleanUrl(payload.url) } : {}),
    ...(typeof payload.referrer === 'string' ? { referrer: cleanUrl(payload.referrer) } : {}),
  };
}

export function Analytics() {
  useEffect(() => {
    const t = tracker(process.env.NEXT_PUBLIC_UMAMI_SRC, process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID);
    if (!t || !LIVE_HOSTS.includes(window.location.hostname) || document.querySelector(`script[src="${t.src}"]`)) return;
    window.clearUmamiBeforeSend = beforeSend;
    const s = document.createElement('script');
    s.defer = true;
    s.src = t.src;
    s.dataset.websiteId = t.id;
    s.dataset.domains = LIVE_HOSTS.join(',');
    s.dataset.excludeHash = 'true';
    s.dataset.beforeSend = 'clearUmamiBeforeSend';
    document.head.appendChild(s);
  }, []);
  return null;
}

/* An event, if Umami is there: the join form calls it once the API has kept the answer. */
export function track(event: string, props?: Record<string, string>): void {
  try {
    window.umami?.track(event, props);
  } catch {
    /* analytics never gets in the way of the page */
  }
}
