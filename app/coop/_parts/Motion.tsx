'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useGsap, gsap, ScrollTrigger, motionOK } from '@/lib/anim';
import { GOVERNANCE, WHO } from '@/content/coop';

/* Scroll-triggered motion for this page's server-rendered figures, plus the
   board-size toggle. Every wrapper animates FROM a start state TO the markup
   it was given; with reduced motion (useGsap does nothing) or without JS the
   figures stand finished. */

const all = <T extends Element = HTMLElement>(root: Element, sel: string) => Array.from(root.querySelectorAll<T>(sel));

/* 02: balances grow while votes stay at one; council chairs light up. */
export function GovMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const root = ref.current!;
    const bars = all(root, '.bal .bar');
    const dots = all(root, '.cns .dots i');
    gsap.set(bars, { scaleX: 0 });
    gsap.set(dots, { scale: 0 });
    ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(bars, { scaleX: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out' });
        gsap.to(dots, { scale: 1, duration: 0.3, stagger: 0.03, delay: 0.2, ease: 'back.out(2)' });
      },
    });
  });
  return <div ref={ref}>{children}</div>;
}

/* 02: the board at any size, one third always delegated from the councils. */
export function BoardSize() {
  const B = GOVERNANCE.board;
  const [n, setN] = useState<number>(B.start);
  const seats = useRef<HTMLDivElement>(null);
  const d = n / 3;

  const pick = (k: number) => {
    setN(k);
    if (motionOK()) {
      /* After React has drawn the new seats. */
      requestAnimationFrame(() => {
        const is = seats.current?.querySelectorAll('i');
        if (is?.length) gsap.from(is, { opacity: 0, y: 6, duration: 0.35, stagger: 0.025, ease: 'power2.out' });
      });
    }
  };

  return (
    <div className="brd">
      <div className="sz" role="group" aria-label={B.sizeLabel}>
        {B.sizes.map((k) => (
          <button key={k} type="button" aria-pressed={k === n} onClick={() => pick(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="seatsN" ref={seats} style={{ ['--n' as string]: n }} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <i key={`${n}-${i}`} className={i < d ? 'd' : undefined} />
        ))}
      </div>
      <span className="cap" aria-live="polite">
        <b>{d}</b> {B.capOf} {n} {B.capTail}
      </span>
    </div>
  );
}

/* 03: the main line runs, then the fork peels off it. */
export function ForkMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, () => {
    const root = ref.current!;
    const mains = all<SVGPathElement>(root, '.main');
    mains.forEach((p) => {
      const L = Math.ceil(p.getTotalLength());
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });
    const br = all(root, '.br');
    const marks = all(root, '.cm:not(.fk), text:not(.fk-t)');
    const forked = all(root, '.cm.fk, .fk-t');
    gsap.set([...br, ...marks, ...forked], { opacity: 0 });
    ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap
          .timeline()
          .to(mains, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
          .to(marks, { opacity: 1, duration: 0.3, stagger: 0.06 }, '-=1.2')
          .to(br, { opacity: 1, duration: 0.6 }, '+=.1')
          .to(forked, { opacity: 1, duration: 0.3, stagger: 0.1 }, '-=.2');
      },
    });
  });
  return (
    <div className="fork" ref={ref}>
      {children}
    </div>
  );
}

/* 04: the year counts down to 2017 from this one. */
export function YearCount() {
  const ref = useRef<HTMLSpanElement>(null);
  const { year, countFrom } = WHO.progress;
  useGsap(ref, () => {
    const el = ref.current!;
    const o = { v: countFrom };
    el.textContent = String(countFrom);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(o, { v: year, duration: 1.2, ease: 'power3.out', onUpdate: () => {
            el.textContent = String(Math.round(o.v));
          },
        });
      },
    });
    return () => {
      el.textContent = String(year);
    };
  });
  return (
    <span className="yr" ref={ref}>
      {String(year)}
    </span>
  );
}
