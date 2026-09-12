import Link from 'next/link';
import { NAV, JOIN } from '@/content/nav';
import { Logo } from '@/components/marks/Logo';
import { Button } from '@/components/primitives/Button';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';

/* Not sticky. The homepage spends its motion budget on two scroll-linked
   moments (§6); a header that also moves competes with them. */

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="Clear — home">
        <Logo size={21} />
      </Link>

      <nav className="header-nav t-sm" aria-label="Main">
        <ul>
          {NAV.map((r) => (
            <li key={r.href}>
              <NavLink href={r.href}>{r.label}</NavLink>
            </li>
          ))}
        </ul>
        <Button href={JOIN.href} variant="ghost" live>{JOIN.label}</Button>
      </nav>

      <div className="header-mobile">
        <MobileNav />
      </div>
    </header>
  );
}
