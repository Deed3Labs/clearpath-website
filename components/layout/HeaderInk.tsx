'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/anim/gsap';

/* The header follows the ground beneath it. It is sticky, and while an ink
   band sits under it the header swaps to its "on ink" colours; after the
   first few pixels of scroll it gains a hairline. Header.tsx itself is not
   touched: this only toggles two classes on the element it renders.

   It also publishes the header's live height as --head-h on <html>, so a bar
   that sticks under the header (the Crumbbar on the shop, event and partner
   pages) sits exactly below it at every width, and gives each such bar the
   same on-ink swap while a band is under it.

   Colour, not motion, so it runs under reduced motion too. */

export function HeaderInk() {
  const pathname = usePathname();

  /* The header's height changes at the 1000px menu switch and when fonts
     settle; an observer keeps --head-h true without reading it on scroll. */
  useEffect(() => {
    const head = document.querySelector<HTMLElement>('.site-header');
    if (!head) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty('--head-h', `${head.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(head);
    return () => ro.disconnect();
  }, []);

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
      const bands = Array.from(document.querySelectorAll<HTMLElement>("main .band-ink, main .hx-band[data-tone='ink']"));
      triggers = bands.map((band) =>
        ScrollTrigger.create({
          trigger: band,
          start: 'top 34px',
          end: 'bottom 34px',
          onToggle: (s) => head.classList.toggle('on-ink', s.isActive),
        }),
      );
      /* A crumb bar sits under the header, so it meets a band lower down:
         at the header's height plus half its own. */
      const bars = Array.from(document.querySelectorAll<HTMLElement>('.crumbbar-w'));
      for (const bar of bars) {
        const at = () => head.offsetHeight + bar.offsetHeight / 2;
        triggers.push(
          ...bands.map((band) =>
            ScrollTrigger.create({
              trigger: band,
              start: () => `top ${at()}px`,
              end: () => `bottom ${at()}px`,
              onToggle: (s) => bar.classList.toggle('on-ink', s.isActive),
            }),
          ),
        );
      }
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      triggers.forEach((t) => t.kill());
      head.classList.remove('on-ink');
      document.querySelectorAll('.crumbbar-w.on-ink').forEach((b) => b.classList.remove('on-ink'));
    };
  }, [pathname]);

  return null;
}
