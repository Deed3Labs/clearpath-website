'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Media, PlateTone, ProductKind } from '@/content/shop';
import { HARDWARE_COPY } from '@/content/shop';
import { gsap, motionOK, useIsoLayoutEffect } from '@/lib/anim';
import { usePlateDraw } from './motion';
import { ProductPlate } from './ProductPlate';

/* A hardware product's pictures: the renders, then the shop's drawing, then
 * the CAD sheets, as tabs over one 16:11 frame. Renders cover the frame
 * (they are made from the CAD models, and say so under the thumbs); the
 * drawing and the sheets are contained, the sheets on paper.
 *
 * Every slide is in the markup and all but the chosen one are hidden, so
 * with JS off the first render shows and the rest are a click away once it
 * loads. Arrows, Home and End move along the thumbs and choose (automatic
 * activation, as tabs do). The drawing draws itself in the first time it
 * is shown: hidden, it never intersects, so the draw-in waits for it. */

type Slide = { id: string; kind: 'render' | 'drawing' | 'cad'; b: string; s: string; src?: string; alt?: string };

export function HardwareGallery({ slug, kind, tone, media }: { slug: string; kind: ProductKind; tone: PlateTone; media: Media[] }) {
  const g = HARDWARE_COPY.gallery;
  const slides: Slide[] = [
    ...media.filter((m) => m.kind === 'render').map((m, i) => ({ id: `r${i}`, kind: 'render' as const, b: g.render, s: m.caption, src: m.src, alt: m.alt })),
    { id: 'd', kind: 'drawing' as const, b: g.drawing.b, s: g.drawing.s },
    ...media.filter((m) => m.kind === 'cad').map((m, i) => ({ id: `c${i}`, kind: 'cad' as const, b: g.cad, s: m.caption, src: m.src, alt: m.alt })),
  ];
  const [cur, setCur] = useState(0);
  const main = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);

  usePlateDraw(main);

  /* The chosen slide fades in over the last. */
  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = main.current?.querySelector<HTMLElement>(`[data-i="${cur}"]`);
    if (!el || !motionOK()) return;
    const tw = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' });
    return () => {
      tw.revert();
    };
  }, [cur]);

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const n = slides.length;
    const j =
      e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    tabs.current[j]?.focus();
    setCur(j);
  }

  const id = (s: Slide, part: 'tab' | 'panel') => `${slug}-${s.id}-${part}`;

  return (
    <div className="gal">
      <div className="gal-wrap" ref={main} data-draw="">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="gslide"
            data-i={i}
            id={id(s, 'panel')}
            role="tabpanel"
            aria-labelledby={id(s, 'tab')}
            hidden={i !== cur}
          >
            {s.kind === 'render' ? (
              <div className="gm r">
                <Image src={s.src!} alt={s.alt!} fill priority={i === 0} sizes="(max-width: 1000px) 100vw, 54vw" />
              </div>
            ) : s.kind === 'drawing' ? (
              <ProductPlate kind={kind} tone={tone} className="gm" />
            ) : (
              <div className="gm d">
                {/* A drawing sheet, shown as drawn: an SVG, not a photo to optimise. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.alt} loading="lazy" />
              </div>
            )}
            <span className="cap3">
              {s.b} · {s.s}
            </span>
          </div>
        ))}
      </div>
      <div className="thumbs2" role="tablist" aria-label={g.label}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            ref={(b) => {
              tabs.current[i] = b;
            }}
            type="button"
            className="thumb"
            role="tab"
            id={id(s, 'tab')}
            aria-controls={id(s, 'panel')}
            aria-selected={i === cur}
            tabIndex={i === cur ? 0 : -1}
            onClick={() => setCur(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {s.kind === 'render' ? (
              <span className="ti r">
                <Image src={s.src!} alt="" fill sizes="52px" />
              </span>
            ) : s.kind === 'drawing' ? (
              <ProductPlate kind={kind} tone={tone} />
            ) : (
              <span className="ti d">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" loading="lazy" />
              </span>
            )}
            <span>
              <b>{s.b}</b>
              <small>{s.s}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="gnote">{g.note}</p>
    </div>
  );
}
