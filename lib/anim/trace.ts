'use client';

/* Light along a line. One engine for every trace on the site: a path built in
   the host element's own pixels, and a short lit segment (soft halo over a thin
   core) that runs along it. The path is rebuilt whenever the host resizes, so
   a trace drawn at one width is never wrong at another.

   The halo's blur is the global #glow filter, rendered once in the layout
   (GlowDefs), so a page never ships its own copy. */

import { useEffect, useRef, type RefObject } from 'react';
import { gsap, motionOK } from './gsap';

const NS = 'http://www.w3.org/2000/svg';

type Side = 'top' | 'right' | 'bottom' | 'left';

/* Rounded rectangle, clockwise, starting at the middle of a chosen side. */
export function rr(x: number, y: number, w: number, h: number, r: number, start: Side = 'top') {
  const L = x, T = y, R = x + w, B = y + h;
  const seg: Record<Side, string> = {
    top: `L ${R - r} ${T} A ${r} ${r} 0 0 1 ${R} ${T + r}`,
    right: `L ${R} ${B - r} A ${r} ${r} 0 0 1 ${R - r} ${B}`,
    bottom: `L ${L + r} ${B} A ${r} ${r} 0 0 1 ${L} ${B - r}`,
    left: `L ${L} ${T + r} A ${r} ${r} 0 0 1 ${L + r} ${T}`,
  };
  const starts: Record<Side, [number, number]> = {
    top: [L + w / 2, T],
    right: [R, T + h / 2],
    bottom: [L + w / 2, B],
    left: [L, T + h / 2],
  };
  const order: Side[] = ['top', 'right', 'bottom', 'left'];
  const i = order.indexOf(start);
  const [sx, sy] = starts[start];
  let d = `M ${sx} ${sy} `;
  for (let k = 0; k < 4; k++) d += seg[order[(i + k) % 4]] + ' ';
  return d + `L ${sx} ${sy}`;
}

export type RunOpts = {
  ease?: string;
  repeat?: number;
  repeatDelay?: number;
  done?: () => void;
};

export type Trace = { run: (o?: RunOpts) => void; kill: () => void };

/* Under reduced motion there is no layer at all, and run() calls `done`
   straight away so a flow that waits on the light still reaches its end. */
const inert: Trace = { run: (o) => o?.done?.(), kill: () => {} };

export function useTrace(
  host: RefObject<HTMLElement | null>,
  build: (w: number, h: number, host: HTMLElement) => string,
  { seg = 140, speed = 520, className }: { seg?: number; speed?: number; className?: string } = {},
): RefObject<Trace> {
  const api = useRef<Trace>(inert);
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    const el = host.current;
    if (!el || !motionOK()) {
      api.current = inert;
      return;
    }
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('trace');
    if (className) svg.classList.add(className);
    svg.setAttribute('aria-hidden', 'true');
    const halo = document.createElementNS(NS, 'path');
    halo.classList.add('halo');
    const core = document.createElementNS(NS, 'path');
    core.classList.add('core');
    svg.append(halo, core);
    el.appendChild(svg);

    let len = 0;
    let tw: gsap.core.Tween | null = null;
    const layout = () => {
      const w = el.clientWidth, h = el.clientHeight;
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const d = buildRef.current(w, h, el);
      halo.setAttribute('d', d);
      core.setAttribute('d', d);
      len = core.getTotalLength();
      for (const p of [halo, core]) {
        p.style.strokeDasharray = `${seg} ${len + seg}`;
        p.style.strokeDashoffset = String(seg);
      }
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);

    api.current = {
      run(o = {}) {
        tw?.kill();
        layout();
        const v = { v: seg };
        tw = gsap.to(v, {
          v: -len,
          duration: len / speed,
          ease: o.ease ?? 'power1.inOut',
          repeat: o.repeat ?? 0,
          repeatDelay: o.repeatDelay ?? 0,
          onUpdate: () => {
            halo.style.strokeDashoffset = String(v.v);
            core.style.strokeDashoffset = String(v.v);
          },
          onComplete: o.done,
        });
      },
      kill() {
        tw?.kill();
        for (const p of [halo, core]) p.style.strokeDashoffset = String(seg);
      },
    };

    return () => {
      tw?.kill();
      ro.disconnect();
      svg.remove();
      api.current = inert;
    };
  }, [host, seg, speed, className]);

  return api;
}
