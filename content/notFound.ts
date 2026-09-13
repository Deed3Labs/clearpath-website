/* The 404. */

export const NOT_FOUND = {
  kicker: 'Page not found',
  heading: 'This link goes nowhere.',
  lede: 'The page may have moved, or the address has a typo. One of these should get you where you meant to go.',
  home: 'Go to the homepage',
  join: 'Join',
  linksLabel: 'Where people usually head',
  links: [
    { href: '/how', label: 'How it works', note: 'Membership, savings and shop plans' },
    { href: '/shops', label: 'For shops', note: 'Offer plans at your business' },
    { href: '/housing', label: 'Housing', note: 'Homes on land members hold in common' },
    { href: '/events', label: 'Events', note: 'Calls, town halls and local meetings' },
    { href: '/coop', label: 'The co-op', note: 'Structure and governance' },
  ],
} as const;
