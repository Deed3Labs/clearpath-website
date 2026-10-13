'use client';

import { useRef } from 'react';
import { useHeroIntro, type gsap } from '@/lib/anim';

/* Extra beats on the hero's intro timeline, after the stage has arrived —
   the mockup's per-page tail (the offer's bars drawing, here). Rendered
   inside the hero so useHeroIntro can hear the timeline being built. Each
   beat is a gsap.from on the elements a selector finds in the hero, at a
   position on the timeline. Under reduced motion nothing runs. */

export type Beat = { sel: string; from: gsap.TweenVars; at?: string };

export function HeroBeat({ beats }: { beats: readonly Beat[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  useHeroIntro(ref, (tl, hero) => {
    for (const b of beats) {
      const els = hero.querySelectorAll(b.sel);
      if (els.length) tl.from(els, b.from, b.at);
    }
  });
  return <span ref={ref} hidden />;
}
