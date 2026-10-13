'use client';

import { useRef } from 'react';
import { LogoMark } from '@/components/marks/Logo';
import { gsap, ScrollTrigger, useGsap } from '@/lib/anim';
import { WHY } from '@/content/directory';

/* Section 02's three drawings: the member → partner → co-op loop with a dot
   going round, Clear Pay paid at the sale against a card "paid, days later",
   and a referred pin landing on the map.

   The markup is the end state (the dot at the top of the loop, the card
   line drawn, the pin landed), which is what JavaScript off and reduced
   motion show. Motion starts when the cells come into view and only moves,
   fades and scales; the card line is drawn with its dash offset. */

const A = WHY.art;

function Loop() {
  return (
    <svg viewBox="0 0 320 140">
      <path className="r" id="why-loop" d="M160 22 A52 52 0 1 1 159.9 22 Z" />
      <rect className="bgk" x="146" y="8" width="28" height="28" />
      <rect className="o" x="146.5" y="8.5" width="27" height="27" />
      <g transform="translate(152 14)" fill="none" stroke="currentColor" strokeWidth="1.3" className="ink">
        <circle cx="8" cy="5" r="2.8" />
        <path d="M2.5 15c0-3.2 2.4-5 5.5-5s5.5 1.8 5.5 5" />
      </g>
      <rect className="bgk" x="191" y="88" width="28" height="28" />
      <rect className="o" x="191.5" y="88.5" width="27" height="27" />
      <g transform="translate(197 94) scale(.8889)" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="ink">
        <path d="M2.5 7.5l1.2-4h10.6l1.2 4" />
        <path d="M2.5 7.5c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
        <path d="M3.5 9.3V15.5h11V9.3M7.5 15.5v-3.5h3v3.5" />
      </g>
      <rect className="f" x="101" y="88" width="28" height="28" />
      <g transform="translate(107 94)" className="gnd">
        <LogoMark size={16} variant="solid" />
      </g>
      <circle className="g" id="why-dot" cx="160" cy="22" r="4.5" />
      <text x="186" y="26">{A.member}</text>
      <text x="226" y="106">{A.partner}</text>
      <text x="94" y="106" textAnchor="end">
        {A.coop}
      </text>
    </svg>
  );
}

function Paid() {
  return (
    <svg viewBox="0 0 320 140">
      <text x="0" y="40">{A.clearPay}</text>
      <path className="r" d="M90 36 H310" />
      <circle className="f" cx="110" cy="36" r="5" />
      <circle className="g" id="why-paid" cx="110" cy="36" r="10" opacity=".35" />
      <text x="102" y="20">{A.salePaid}</text>
      <text x="0" y="98">{A.card}</text>
      <path className="r" d="M90 94 H310" />
      <circle className="f" cx="110" cy="94" r="5" />
      <path className="o" id="why-card" d="M110 94 H282" />
      <circle className="o" cx="282" cy="94" r="5" />
      <text x="102" y="122">{A.sale}</text>
      <text x="282" y="122" textAnchor="middle">
        {A.later}
      </text>
    </svg>
  );
}

function Referred() {
  return (
    <svg viewBox="0 0 320 140">
      <path className="r" d="M10 110 C80 90 120 120 180 96 S280 60 310 74" />
      <circle className="r" cx="54" cy="100" r="6" />
      <circle className="r" cx="128" cy="108" r="6" />
      <circle className="r" cx="292" cy="70" r="6" />
      <g id="why-pin">
        <circle className="g" cx="214" cy="84" r="16" opacity=".25" id="why-ring" />
        <path className="f" d="M214 84 c-10 -12 -14 -18 -14 -26 a14 14 0 0 1 28 0 c0 8 -4 14 -14 26 z" />
        <circle className="bgk" cx="214" cy="58" r="5" />
      </g>
      <text x="214" y="132" textAnchor="middle">
        {A.referred}
      </text>
    </svg>
  );
}

const ART = [Loop, Paid, Referred];

export function WhyArt() {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(ref, () => {
    const el = ref.current;
    if (!el) return;
    const q = <T extends Element>(s: string) => el.querySelector<T>(s);
    const loopPath = q<SVGPathElement>('#why-loop');
    const dot = q<SVGCircleElement>('#why-dot');
    const card = q<SVGPathElement>('#why-card');
    if (!loopPath || !dot || !card) return;

    gsap.from(el.children, { opacity: 0, y: 18, duration: 0.7, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } });

    /* The dot goes round the loop, moved (not re-placed) along the path. */
    const L = loopPath.getTotalLength();
    const o = { t: 0 };
    const loop = gsap.to(o, {
      t: 1,
      duration: 4.5,
      ease: 'none',
      repeat: -1,
      paused: true,
      onUpdate: () => {
        const pt = loopPath.getPointAtLength(o.t * L);
        gsap.set(dot, { x: pt.x - 160, y: pt.y - 22 });
      },
    });

    const len = card.getTotalLength();
    gsap.set(card, { strokeDasharray: len });
    const tl = gsap
      .timeline({ paused: true, repeat: -1, repeatDelay: 1.2 })
      .fromTo('#why-paid', { scale: 0.6, opacity: 0.6, transformOrigin: '50% 50%' }, { scale: 1.8, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0)
      .fromTo(card, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' }, 0)
      .fromTo('#why-pin', { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'bounce.out' }, 0.4)
      .fromTo('#why-ring', { scale: 0.375, opacity: 0.5, transformOrigin: '50% 50%' }, { scale: 1.5, opacity: 0, duration: 1, ease: 'power2.out' }, 1.1);

    /* Only while the drawings can be seen. */
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom top',
      onToggle: (s) => {
        if (s.isActive) {
          loop.play();
          tl.play();
        } else {
          loop.pause();
          tl.pause();
        }
      },
    });
  });

  return (
    <div className="why3d body-gap" ref={ref}>
      {WHY.sides.map((s, i) => {
        const Art = ART[i];
        return (
          <div className="cell" key={s.label}>
            <div className="c-h">
              <span className="who">{s.label}</span>
              <span className="ck">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="c-m">
              <div className="art" aria-hidden="true">
                <Art />
              </div>
              <h3>{s.line}</h3>
              <p>{s.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
