'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

type Item = { href: string; label: string; note: string };

/* A header item that opens a short menu of links.
 *
 * Disclosure pattern, not role="menu": these are ordinary links, and a
 * screen reader should announce them as links in a list. The button says
 * whether the panel is open (aria-expanded) and what it controls.
 *
 * Opens on click, and on hover for a mouse — a pointer that has to click to
 * see two links feels slow, but hover alone strands keyboard and touch. It
 * closes on Escape (focus returns to the button), an outside click, focus
 * leaving the menu, and navigation.
 */
export function NavMenu({ label, items }: { label: string; items: Item[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const hoverClose = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const path = usePathname();

  const current = items.some((i) => path === i.href || path.startsWith(`${i.href}/`));

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cancelHoverClose = () => {
    if (hoverClose.current) clearTimeout(hoverClose.current);
  };

  return (
    <div
      ref={root}
      className="navmenu"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        cancelHoverClose();
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        // A short grace period, so crossing the gap to the panel does not close it.
        hoverClose.current = setTimeout(() => setOpen(false), 180);
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className="navlink navmenu-button"
        aria-expanded={open}
        aria-controls={id}
        data-current={current ? '' : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <svg className="navmenu-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 3.5l3 3 3-3" />
        </svg>
      </button>

      <div id={id} className="navmenu-panel" hidden={!open}>
        <ul>
          {items.map((i) => {
            const here = path === i.href || path.startsWith(`${i.href}/`);
            return (
              <li key={i.href}>
                <Link href={i.href} className="navmenu-link" aria-current={here ? 'page' : undefined}>
                  <span className="navmenu-label">{i.label}</span>
                  <span className="navmenu-note">{i.note}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
