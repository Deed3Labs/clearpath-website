'use client';

import { useRef, type ReactNode } from 'react';
import { useHeroIntro } from '@/lib/anim/hooks';
import { motionOK } from '@/lib/anim/gsap';
import { CLOSED, items } from '@/content/shop';
import { useBag } from './BagProvider';

/* The closed shop's beats on the hero intro, after the words and the form:
   the scene behind the glass assembles, the board's values rise into their
   rows, and the sign swings once and settles at −2°, the angle it hangs at
   in the markup. Rendered inside the hero (useHeroIntro). Reduced motion or
   no JS: the sign simply hangs at −2°. */
export function ClosedBeats() {
  const ref = useRef<HTMLSpanElement>(null);
  useHeroIntro(ref, (tl, hero) => {
    const scene = hero.querySelectorAll('.scg > *');
    const vals = hero.querySelectorAll('.board2 .v');
    const sign = hero.querySelector('.sign');
    if (sign) {
      tl.fromTo(
        sign,
        { rotation: 9 },
        {
          keyframes: [
            { rotation: -6, duration: 0.7 },
            { rotation: 3.5, duration: 0.6 },
            { rotation: -3, duration: 0.55 },
            { rotation: -2, duration: 0.75 },
          ],
          ease: 'sine.inOut',
          transformOrigin: '50% 0%',
        },
        0.2,
      );
    }
    if (scene.length) tl.from(scene, { opacity: 0, y: 10, duration: 0.5, stagger: 0.035, ease: 'power3.out' }, 0.35);
    if (vals.length) tl.from(vals, { yPercent: 110, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.4);
  });
  return <span ref={ref} hidden />;
}

/* "Your bag · Saved here · 2 items" on the door, when this device has one.
   Client-only: the bag lives in this browser's storage. */
export function BagRow() {
  const { ready, count } = useBag();
  if (!ready || !count) return null;
  return (
    <div>
      <dt>{CLOSED.board.bag}</dt>
      <dd>
        <span className="v">
          {CLOSED.board.bagValue} · {items(count)}
        </span>
      </dd>
    </div>
  );
}

/* A link to the notify field that brings it to the middle of the screen and
   puts the cursor in it, rather than jumping it under the sticky bars. A
   plain anchor without JS. */
export function NotifyLink({ className, variant, children }: { className?: string; variant?: 'primary'; children: ReactNode }) {
  return (
    <a
      href="#notify"
      className={className}
      data-variant={variant}
      onClick={(e) => {
        const f = document.getElementById('notify');
        if (!f) return;
        e.preventDefault();
        const smooth = motionOK();
        f.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
        setTimeout(() => f.querySelector('input')?.focus({ preventScroll: true }), smooth ? 500 : 0);
      }}
    >
      {children}
    </a>
  );
}
