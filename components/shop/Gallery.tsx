'use client';

import { useRef, useState } from 'react';
import type { GoodsKind, PlateTone } from '@/content/shop';
import { GALLERY } from '@/content/shop';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { FULL_VB, markViewBox, ProductPlate, type PlateView } from './ProductPlate';
import { usePlateDraw } from './motion';

/* The product page's drawing and its three views: the front, the mark close
   up (the viewBox zooms in to it; an embroidered mark shows its stitching),
   and the back (the piece turns round: it narrows, swaps faces and widens).
   The views are toggle buttons over the one drawing; arrows move between
   them. With JS off the front shows, which is the whole product. */

type View = { k: PlateView; b: string; s: string; cap: string };

export function Gallery({
  kind,
  tone,
  stitch,
  mark,
  back,
}: {
  kind: GoodsKind;
  tone: PlateTone;
  stitch: boolean;
  /* The product's own detail naming its mark, e.g. "Embroidered mark". */
  mark: string;
  /* What is on the back, e.g. "Nothing on it". */
  back: string;
}) {
  const views: View[] = [
    { k: 'front', b: GALLERY.front.b, s: GALLERY.front.s, cap: GALLERY.front.b },
    { k: 'mark', b: GALLERY.mark.b, s: mark, cap: mark },
    { k: 'back', b: GALLERY.back.b, s: back, cap: `${GALLERY.back.b} · ${back.toLowerCase()}` },
  ];
  const [view, setView] = useState<PlateView>('front');
  const main = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const tl = useRef<gsap.core.Timeline | null>(null);

  usePlateDraw(main, { first: 0.15 });

  function show(k: PlateView) {
    if (k === view) return;
    const root = main.current;
    const svg = root?.querySelector('svg');
    if (!root || !svg) return setView(k);
    const was = view;
    setView(k);
    const toBack = k === 'back';
    const vb = k === 'mark' ? markViewBox(kind) : FULL_VB;
    const fx = root.querySelector('.fx'), bx = root.querySelector('.bx2'), mk = root.querySelector('.mkg'), st = root.querySelector('.st');
    const gar = root.querySelector('.gar');
    const faces = () => {
      gsap.set(fx, { opacity: toBack ? 0 : 1 });
      gsap.set(bx, { opacity: toBack ? 1 : 0 });
      gsap.set(mk, { opacity: toBack ? 0 : 1 });
    };
    tl.current?.progress(1).kill();
    if (!motionOK()) {
      svg.setAttribute('viewBox', vb);
      faces();
      if (st) gsap.set(st, { opacity: k === 'mark' ? 0.8 : 0 });
      return;
    }
    const t = gsap.timeline();
    t.to(svg, { attr: { viewBox: vb }, duration: 0.9, ease: 'power3.inOut' }, 0);
    if (st) t.to(st, { opacity: k === 'mark' ? 0.8 : 0, duration: 0.5 }, k === 'mark' ? 0.5 : 0);
    if (toBack !== (was === 'back')) {
      t.to(gar, { scaleX: 0, duration: 0.28, ease: 'power2.in', svgOrigin: '200 200' }, 0)
        .add(faces, 0.28)
        .to(gar, { scaleX: 1, duration: 0.42, ease: 'power3.out', svgOrigin: '200 200' }, 0.28);
    } else faces();
    tl.current = t;
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + views.length) % views.length;
    thumbs.current[j]?.focus();
    show(views[j].k);
  }

  const cur = views.find((v) => v.k === view)!;

  return (
    <div className="gal">
      <div className="gal-wrap" ref={main} data-draw="">
        <ProductPlate kind={kind} tone={tone} stitch={stitch} className="main" caption={<span className="cap3">{cur.cap}</span>} />
      </div>
      <div className="thumbs" role="group" aria-label={GALLERY.label}>
        {views.map((v, i) => (
          <button
            key={v.k}
            ref={(b) => {
              thumbs.current[i] = b;
            }}
            type="button"
            className="thumb"
            aria-pressed={view === v.k}
            onClick={() => show(v.k)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <ProductPlate kind={kind} tone={tone} view={v.k} stitch={stitch} />
            <span>
              <b>{v.b}</b>
              <small>{v.s}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
