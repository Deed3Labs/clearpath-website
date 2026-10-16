'use client';

import { useRef, type RefObject } from 'react';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';

/* ─── Plates draw themselves in ──────────────────────────────────────────
   The outline runs, the ground fills, then the mark lands. Once per plate,
   when it comes into view. The server renders every plate finished; with
   motion allowed, CSS holds the plates inside a [data-draw] root at their
   start state from first paint (shop.css, under html.motion) so they never
   flash finished, and this takes over before the browser paints again. */

const LINES = '.bd, .ln2';

/* A hardware drawing also has parts that are not one stroke with a
   pathLength: its screen's words and rules, QR squares, round details. They
   wait for the outline and fade in with the fill. Goods have none. */
function restOf(pl: Element) {
  if (!pl.classList.contains('hwplate')) return [];
  return Array.from(pl.querySelectorAll<SVGElement>('.gar *')).filter(
    (el) => el.tagName !== 'g' && !el.classList.contains('oc') && !el.closest('.mk') && !(el.matches(LINES) && el.hasAttribute('pathLength')),
  );
}

/* The opacity an element rests at without the inline start state (a dim
   word on a screen rests at .55, not 1). */
function restingOpacity(el: SVGElement) {
  const was = el.style.opacity;
  el.style.opacity = '';
  const o = getComputedStyle(el).opacity;
  el.style.opacity = was;
  return o;
}

function startState(pl: Element) {
  const paths = Array.from(pl.querySelectorAll<SVGPathElement>(LINES)).filter(
    (p) => p.style.opacity !== '0' && p.hasAttribute('pathLength'),
  );
  gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
  gsap.set(restOf(pl), { opacity: 0 });
  gsap.set(pl.querySelectorAll('.mk'), { scale: 0, transformOrigin: '50% 50%' });
  return paths;
}

export function drawPlate(pl: Element, delay = 0) {
  const paths = startState(pl);
  const rest = restOf(pl);
  const mk = pl.querySelectorAll('.mk');
  return gsap
    .timeline({ delay })
    .to(paths, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: paths.length > 6 ? 0.04 : 0.18 })
    .to(paths, { fillOpacity: 1, duration: 0.5 }, '-=.35')
    .to(rest, { opacity: (_: number, el: SVGElement) => restingOpacity(el), duration: 0.5 }, '<')
    .to(mk, { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, '-=.45')
    .set(paths, { clearProps: 'strokeDasharray,strokeDashoffset,fillOpacity' })
    .set(rest, { clearProps: 'opacity' })
    .set(mk, { clearProps: 'transform' });
}

/* Every .plate under `root` draws in once as it enters view (35% visible).
   Plates that enter together are staggered; `first` delays the first batch
   so a plate in the opening view waits for the hero's words. */
export function usePlateDraw(root: RefObject<HTMLElement | null>, { first = 0 }: { first?: number } = {}) {
  const firstRef = useRef(first);
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const plates = Array.from(el.querySelectorAll<HTMLElement>('.plate'));
    const mark = () => plates.forEach((p) => p.setAttribute('data-drawn', ''));
    if (!motionOK()) {
      mark();
      return;
    }
    plates.forEach(startState);
    mark();
    let batch = 0;
    const tls: gsap.core.Timeline[] = [];
    const io = new IntersectionObserver(
      (es) => {
        const hits = es.filter((e) => e.isIntersecting).map((e) => e.target);
        hits.forEach((t, i) => {
          io.unobserve(t);
          tls.push(drawPlate(t, (batch === 0 ? firstRef.current : 0) + i * 0.08));
        });
        if (hits.length) batch++;
      },
      { threshold: 0.35 },
    );
    plates.forEach((p) => io.observe(p));
    return () => {
      io.disconnect();
      tls.forEach((t) => t.kill());
      plates.forEach((p) => {
        gsap.set(p.querySelectorAll(LINES), { clearProps: 'strokeDasharray,strokeDashoffset,fillOpacity' });
        gsap.set(restOf(p), { clearProps: 'opacity' });
        gsap.set(p.querySelectorAll('.mk'), { clearProps: 'transform' });
      });
    };
  }, [root]);
}

/* ─── An add, announced to the bag pill ──────────────────────────────────
   Whatever adds to the bag (a shelf tile, the product page) says so here,
   BEFORE it calls add(), with where on screen the add came from. The shop
   bar answers: a dot flies from there to the bag count, the count bumps,
   and the mini-bag drops. The bag itself is only ever BagProvider's. */

export type Added = { slug: string; variant: string; qty: number; from: DOMRect };

const EVENT = 'shop:added';

export function announceAdd(a: Added) {
  window.dispatchEvent(new CustomEvent<Added>(EVENT, { detail: a }));
}

export function onAdded(fn: (a: Added) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Added>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

/* A dot carries the item up to the bag on an arc. Calls `done` at once when
   there is nothing to animate (reduced motion, or no target on screen). */
export function fly(from: DOMRect, to: Element | null, done: () => void) {
  const b = to?.getBoundingClientRect();
  if (!motionOK() || !b || !b.width) {
    done();
    return () => {};
  }
  const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  const cx = (x0 + x1) / 2 + (x1 > x0 ? -60 : 60), cy = Math.min(y0, y1) - 140;
  const d = document.createElement('span');
  d.setAttribute('aria-hidden', 'true');
  Object.assign(d.style, {
    position: 'fixed',
    zIndex: '60',
    left: '0',
    top: '0',
    width: '12px',
    height: '12px',
    margin: '-6px 0 0 -6px',
    borderRadius: '999px',
    background: 'var(--color-signal-light)',
    boxShadow: '0 0 10px 2px rgb(111 203 159 / .6)',
    pointerEvents: 'none',
    transform: `translate(${x0}px, ${y0}px)`,
  });
  document.body.appendChild(d);
  const o = { t: 0 };
  const tw = gsap.to(o, {
    t: 1,
    duration: 0.8,
    ease: 'power2.in',
    onUpdate() {
      const t = o.t, u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
      const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      d.style.transform = `translate(${x}px, ${y}px) scale(${1 - t * 0.35})`;
    },
    onComplete() {
      d.remove();
      done();
    },
  });
  return () => {
    tw.kill();
    d.remove();
  };
}
