'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/anim/gsap';

/* The header follows the ground beneath it. It is sticky, and while an ink
   band sits under it the header swaps to its "on ink" colours; after the
   first few pixels of scroll it gains a hairline. Header.tsx itself is not
   touched: this only toggles two classes on the element it renders.

   Colour, not motion, so it runs under reduced motion too. */

export function HeaderInk() {
  const pathname = usePathname();

  useEffect(() => {
    const head = document.querySelector<HTMLElement>('.site-header');
    if (!head) return;
    const onScroll = () => head.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let triggers: ScrollTrigger[] = [];
    /* The new route's bands are committed by now, but wait a frame so their
       layout (fonts, scaled screens) has settled before measuring. */
    const raf = requestAnimationFrame(() => {
      triggers = Array.from(document.querySelectorAll<HTMLElement>("main .band-ink, main .hx-band[data-tone='ink']")).map((band) =>
        ScrollTrigger.create({
          trigger: band,
          start: 'top 34px',
          end: 'bottom 34px',
          onToggle: (s) => head.classList.toggle('on-ink', s.isActive),
        }),
      );
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      triggers.forEach((t) => t.kill());
      head.classList.remove('on-ink');
    };
  }, [pathname]);

  return null;
}
