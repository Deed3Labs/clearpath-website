'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { NAV, CONTEXTUAL, HOME, JOIN, COMMUNITY } from '@/content/nav';
import { NavLink } from './NavLink';

/* Built on <dialog>.showModal() rather than a div and a focus-trap library.
   The element traps focus and closes on Escape natively, which is two of the
   §8.6 requirements met by the platform instead of by us — and it keeps a
   Radix dependency out of a page with a 120KB budget. */

export function MobileNav() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  /* Close on navigation. The dialog outlives the route change otherwise. */
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  /* Escape is already UA behaviour for a modal <dialog>, but Chrome handles
     it in the browser process, so it cannot be exercised by an automated key
     event — which makes the §8.6 requirement unverifiable in CI. This makes
     it explicit and testable. Closing twice is a no-op. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ref.current?.close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const open = () => ref.current?.showModal();
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="navtoggle"
        style={{
          minHeight: 44,
          minWidth: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'none',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          fontSize: 15,
        }}
      >
        Menu
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 4h14M1 8h14M1 12h14" />
        </svg>
      </button>

      <dialog ref={ref} className="sheet" aria-label="Main">
        <div className="sheet-inner">
          <div className="sheet-top">
            <span className="t-note">Menu</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              style={{
                minHeight: 44,
                minWidth: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 0,
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l14 14M16 2L2 16" />
              </svg>
            </button>
          </div>

          <nav>
            <ul>
              {/* First, because the wordmark that goes home sits behind this
                  dialog while it is open — without this the sheet is a room
                  with no door back to the front page. */}
              {[HOME, ...NAV].map((r) => (
                <li key={r.href}>
                  <NavLink href={r.href} className="d3 sheet-link">
                    {r.label}
                  </NavLink>
                </li>
              ))}
              {/* The header's Community menu, laid open: a sheet has the room,
                  and a menu inside a menu is one tap too many on a phone. */}
              <li className="sheet-group">
                <p className="sheet-group-label">{COMMUNITY.label}</p>
                <ul>
                  {COMMUNITY.links.map((r) => (
                    <li key={r.href}>
                      <NavLink href={r.href} className="d3 sheet-link">
                        {r.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              {[...CONTEXTUAL, JOIN].map((r) => (
                <li key={r.href}>
                  <NavLink href={r.href} className="d3 sheet-link">
                    {r.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
