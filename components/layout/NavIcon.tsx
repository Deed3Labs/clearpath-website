/* Small line icons for the Community links, drawn at the same weight as the
   shop's bag pill so the two read as one family. Decorative: the link text
   already says where it goes. */
export function NavIcon({ href, size = 18 }: { href: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (href === '/events') {
    return (
      <svg {...common}>
        <rect x="2.5" y="3.5" width="13" height="12" />
        <path d="M2.5 7h13M6 2v3M12 2v3" />
        <path d="M5.5 10h2M5.5 12.5h2M10.5 10h2" />
      </svg>
    );
  }
  if (href === '/directory') {
    return (
      <svg {...common}>
        <path d="M2.5 7.5l1.2-4h10.6l1.2 4" />
        <path d="M2.5 7.5c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
        <path d="M3.5 9.3V15.5h11V9.3M7.5 15.5v-3.5h3v3.5" />
      </svg>
    );
  }
  if (href === '/shop') {
    return (
      <svg {...common}>
        <path d="M3 6.5h12l-1 9H4z" />
        <path d="M6.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" />
      </svg>
    );
  }
  return null;
}
