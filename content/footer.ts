/* Footer copy. §7 — "Footer, every page". */

export const BRAND_LINE = 'A member-owned cooperative, building in Inland Empire, California.';

export type FooterLink = { href: string; label: string; external?: boolean };

export const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Members',
    links: [
      { href: '/how', label: 'How it works' },
      { href: '/housing', label: 'Housing' },
      { href: '/join', label: 'Join the waitlist' },
    ],
  },
  {
    heading: 'Partners',
    links: [
      { href: '/shops', label: 'For shops' },
      { href: '/contribute', label: 'Contribute land' },
      { href: '/capital', label: 'Clear Capital' },
      { href: 'https://merchant.useclear.org', label: 'Merchant app', external: true },
    ],
  },
  {
    heading: 'The co-op',
    links: [
      { href: '/coop', label: 'Structure and governance' },
      {
        href: 'https://github.com/Deed3Labs/Protocol-Contracts',
        label: 'Protocol source',
        external: true,
      },
      { href: '/join?as=work', label: 'Work with us' },
      { href: '/style', label: 'Brand and style guide' },
    ],
  },
];

/* Verbatim from §7. §8 — Legal: this block appears on every page. */
export const LEGAL = [
  'Clear is not a bank and deposits are not FDIC insured. Membership accounts are cooperative capital accounts, not deposit accounts.',
  'Nothing here is an offer to sell or a solicitation to buy any security. Figures shown for housing, savings and credit are illustrations of how the model works, not quotes, offers or predictions. Credit is subject to the terms disclosed in the app before you draw.',
  'We are not tax or legal advisers. Descriptions of property contributions are general and depend entirely on your own circumstances.',
] as const;
