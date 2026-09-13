/* The eight routes. §1
 *
 * NAV is deliberately five links, per §7.6: /capital is reached from
 * /contribute, from /coop and from the footer, not from the nav bar — its
 * audience arrives by introduction, and a sixth item crowds the header at
 * 1080px. /join is a button rather than a nav link, which is what keeps the
 * count at five without hiding it. Easy to promote later if that is wrong. */

export type Route = { href: string; label: string };

export const NAV: readonly Route[] = [
  { href: '/how',        label: 'How it works'   },
  { href: '/shops',      label: 'For shops'      },
  { href: '/housing',    label: 'Housing'        },
  { href: '/contribute', label: 'Contribute land'},
  { href: '/coop',       label: 'The co-op'      },
] as const;

/* Reached contextually, not from the nav. */
export const CONTEXTUAL: readonly Route[] = [
  { href: '/capital', label: 'Clear Capital' },
] as const;

/* Mobile only. On a wide screen the wordmark in the header goes home and is
   always visible; when the sheet is open it is behind a modal, so the sheet
   has to carry its own way back. Deliberately NOT in ROUTES — the sitemap
   already lists "/" on its own line, and adding it here would list it twice. */
export const HOME: Route = { href: '/', label: 'Home' };

export const JOIN: Route = { href: '/join', label: 'Join' };

/* The brand guide. Linked from the footer, not the header or the mobile
   sheet: its readers are designers, partners and press, and a member looking
   for how the co-op works should not trip over it. It is in ROUTES so the
   sitemap lists it — it is meant to be found. */
export const STYLE: Route = { href: '/style', label: 'Brand and style guide' };

/* Merchandise. Footer only, for the same reason as the style guide: the
   header answers to how the co-op works. */
export const SHOP: Route = { href: '/shop', label: 'Shop' };

/* Everything with a URL — sitemap, QA sweeps, the ?debug=grid pass. */
export const ROUTES: readonly Route[] = [...NAV, ...CONTEXTUAL, JOIN, STYLE, SHOP];
