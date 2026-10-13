'use client';

import { useRef, type ReactNode } from 'react';
import { useRail } from '@/lib/anim';
import { int } from '@/lib/format';
import { PATH } from '@/content/home';

/* 02 · The path. The bento's top rule fills as you scroll (useRail), each
   phase's knob darkens as the line reaches it, and the renter's credits count
   up to the first gate — reaching 15,000 exactly as the line reaches the
   owner's knob. The server renders the finished drawing: full rule, every
   phase reached, 15,000 credits and a full ladder. */

export function PathRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useRail(ref, {
    vertical: 760,
    start: 'top 75%',
    end: 'bottom 75%',
    onProgress: (p) => {
      const el = ref.current;
      if (!el) return;
      const knobs = el.querySelectorAll<HTMLElement>('.ph .knob');
      const owner = knobs[1];
      if (!owner) return;
      const r = el.getBoundingClientRect();
      const k = owner.getBoundingClientRect();
      const vert = window.matchMedia('(max-width: 760px)').matches;
      const at = vert ? (k.top + k.height / 2 - r.top) / r.height : (k.left + k.width / 2 - r.left) / r.width;
      const steps = PATH.renter.credits / 10;
      const c = Math.round(Math.min(1, Math.max(0, p / at)) * steps) * 10;
      const fig = el.querySelector('[data-cred]');
      if (fig) fig.textContent = int(c);
      const lad = el.querySelector<HTMLElement>('[data-ladder]');
      if (lad) lad.style.transform = `scaleX(${c / PATH.renter.credits})`;
    },
  });

  return (
    <div ref={ref} className="bx rail path3 body-gap" data-v="760">
      <span className="rail-fill" aria-hidden="true" />
      {children}
    </div>
  );
}
