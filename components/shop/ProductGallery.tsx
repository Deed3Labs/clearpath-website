'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import type { GoodsKind, Media, PlateTone, ProductKind } from '@/content/shop';
import { gsap, motionOK, useIsoLayoutEffect } from '@/lib/anim';
import { usePlateDraw } from './motion';
import { FULL_VB, patchViewBox, ProductPlate, type PlateView } from './ProductPlate';

/* A product's pictures, as tabs over one frame. Goods: the mockups, then
 * the shop's drawing, then the renders (the order the owner chose).
 * Hardware: the renders, the drawing, then the CAD sheets.
 *
 * - Renders and mockups cover the frame and are labelled for what they are
 *   (the note under the thumbs says how they were made). CAD sheets are
 *   contained, on paper.
 * - Hardware has one drawing. Goods have three views of theirs (front, the
 *   patch close up, back) over the one drawing: between them the viewBox
 *   zooms in to the patch, or the piece turns round (it narrows, swaps faces
 *   and widens).
 * - A garment in colours shows only the pictures of the colour picked (and
 *   any without a colour). Changing colour keeps the frame on the same
 *   picture of the new colour where there is one.
 *
 * Every slide is in the markup and all but the chosen one are hidden, so
 * with JS off the first picture shows and the rest are a click away once it
 * loads. Arrows, Home and End move along the thumbs and choose (automatic
 * activation, as tabs do). The drawing draws itself in the first time it is
 * shown: hidden, it never intersects, so the draw-in waits for it. */

type Kind = 'render' | 'drawing' | 'mock' | 'cad';

type Slide = {
  /* Stays the same across colours: the n-th render of a colour, a picture
     with no colour by its file, a drawing by its view. */
  key: string;
  kind: Kind;
  b: string;
  s: string;
  cap: string;
  src?: string;
  alt?: string;
  view?: PlateView;
};

export type GalleryCopy = {
  label: string;
  render: string;
  drawing: string;
  mock: string;
  cad: string;
  note: string;
};

/* Goods' three drawing views: the words for each. */
export type DrawingViews = { b: string; s: string }[];

export function ProductGallery({
  slug,
  kind,
  tone,
  media,
  colour,
  copy,
  drawing,
  stitch,
}: {
  slug: string;
  kind: ProductKind;
  tone: PlateTone;
  media: Media[];
  /* The colour picked, for a garment in colours. */
  colour?: string;
  copy: GalleryCopy;
  /* Hardware: one view ({ b, s } of its drawing). Goods: front, patch, back. */
  drawing: DrawingViews;
  stitch?: boolean;
}) {
  const goods = drawing.length === 3;
  const slides = useMemo(() => {
    const ofColour = (k: Media['kind']) => {
      let n = 0;
      return media
        .filter((m) => m.kind === k && (!m.colour || !colour || m.colour === colour))
        .map<Slide>((m) => {
          const word = k === 'render' ? copy.render : k === 'mock' ? copy.mock : copy.cad;
          return { key: m.colour ? `${k}:${n++}` : m.src, kind: k, b: word, s: m.caption, cap: `${word} · ${m.caption}`, src: m.src, alt: m.alt };
        });
    };
    const views: PlateView[] = goods ? ['front', 'mark', 'back'] : ['front'];
    const drawn = views.map<Slide>((v, i) => ({
      key: `drawing:${v}`,
      kind: 'drawing',
      b: drawing[i].b,
      s: drawing[i].s,
      cap: goods ? `${copy.drawing} · ${drawing[i].b}` : `${drawing[i].b} · ${drawing[i].s}`,
      view: v,
    }));
    return goods ? [...ofColour('mock'), ...drawn, ...ofColour('render')] : [...ofColour('render'), ...drawn, ...ofColour('cad')];
  }, [media, colour, copy, drawing, goods]);

  const [picked, setPicked] = useState<{ key: string; kind: Kind }>({ key: slides[0].key, kind: slides[0].kind });
  /* The colour changed and the picture shown has no match in it: the first
     of the same kind, else the first. */
  const found = slides.findIndex((s) => s.key === picked.key);
  const cur = found >= 0 ? found : Math.max(0, slides.findIndex((s) => s.kind === picked.kind));
  const slide = slides[cur];

  const [view, setView] = useState<PlateView>('front');
  const main = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const first = useRef(true);

  usePlateDraw(main);

  /* The panel shown: a picture, or the drawing (its views share one). */
  const panel = slide.kind === 'drawing' ? 'drawing' : slide.key;

  /* A new panel fades in over the last. */
  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = main.current?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(panel)}"]`);
    if (!el || !motionOK()) return;
    const tw = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' });
    return () => {
      tw.revert();
    };
  }, [panel]);

  /* From one drawing view to another while the drawing shows: zoom to the
     patch, or turn the piece round. From a picture, the view is just set.
     The main drawing is always rendered as the front, and this moves it, so
     React never undoes a view mid-turn. */
  function turnTo(k: PlateView) {
    const root = main.current?.querySelector<HTMLElement>('[data-panel="drawing"]');
    const svg = root?.querySelector('svg');
    if (!root || !svg || k === view) return;
    const from = view;
    setView(k);
    const toBack = k === 'back';
    const vb = k === 'mark' ? patchViewBox(kind as GoodsKind) : FULL_VB;
    const fx = root.querySelectorAll('.fx'), bx = root.querySelectorAll('.bx2'), mk = root.querySelectorAll('.mkg'), st = root.querySelector('.st');
    const gar = root.querySelector('.gar');
    const faces = () => {
      gsap.set(fx, { opacity: toBack ? 0 : 1 });
      gsap.set(bx, { opacity: toBack ? 1 : 0 });
      gsap.set(mk, { opacity: toBack ? 0 : 1 });
    };
    tl.current?.progress(1).kill();
    if (!motionOK() || slide.kind !== 'drawing') {
      svg.setAttribute('viewBox', vb);
      faces();
      if (st) gsap.set(st, { opacity: k === 'mark' ? 0.8 : 0 });
      return;
    }
    const t = gsap.timeline();
    t.to(svg, { attr: { viewBox: vb }, duration: 0.9, ease: 'power3.inOut' }, 0);
    if (st) t.to(st, { opacity: k === 'mark' ? 0.8 : 0, duration: 0.5 }, k === 'mark' ? 0.5 : 0);
    if (toBack !== (from === 'back')) {
      t.to(gar, { scaleX: 0, duration: 0.28, ease: 'power2.in', svgOrigin: '200 200' }, 0)
        .add(faces, 0.28)
        .to(gar, { scaleX: 1, duration: 0.42, ease: 'power3.out', svgOrigin: '200 200' }, 0.28);
    } else faces();
    tl.current = t;
  }

  function choose(i: number) {
    const s = slides[i];
    if (s.kind === 'drawing' && s.view && goods) turnTo(s.view);
    setPicked({ key: s.key, kind: s.kind });
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const n = slides.length;
    const j =
      e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    tabs.current[j]?.focus();
    choose(j);
  }

  const id = (i: number, part: 'tab' | 'panel') => `${slug}-${i}-${part}`;
  const drawIdx = slides.findIndex((s) => s.kind === 'drawing');
  /* Each tab controls its panel; the drawing's views all control the drawing. */
  const panelOf = (i: number) => (slides[i].kind === 'drawing' ? drawIdx : i);

  return (
    <div className="gal">
      <div className="gal-wrap" ref={main} data-draw="">
        {slides.map((s, i) => {
          if (s.kind === 'drawing' && i !== drawIdx) return null;
          const shown = s.kind === 'drawing' ? slide.kind === 'drawing' : i === cur;
          return (
            <div
              key={s.kind === 'drawing' ? 'drawing' : s.key}
              className="gslide"
              data-panel={s.kind === 'drawing' ? 'drawing' : s.key}
              id={id(i, 'panel')}
              role="tabpanel"
              aria-labelledby={id(s.kind === 'drawing' && slide.kind === 'drawing' ? cur : i, 'tab')}
              hidden={!shown}
            >
              {s.kind === 'drawing' ? (
                <ProductPlate kind={kind} tone={tone} stitch={stitch} className="gm" />
              ) : s.kind === 'cad' ? (
                <div className="gm d">
                  {/* A drawing sheet, shown as drawn: an SVG, not a photo to optimise. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.alt} loading="lazy" />
                </div>
              ) : (
                <div className="gm r">
                  <Image src={s.src!} alt={s.alt!} fill priority={i === 0} sizes="(max-width: 1000px) 100vw, 54vw" />
                </div>
              )}
              <span className="cap3">{shown ? slide.cap : s.cap}</span>
            </div>
          );
        })}
      </div>
      <div className="thumbs2" role="tablist" aria-label={copy.label}>
        {slides.map((s, i) => (
          <button
            key={s.key}
            ref={(b) => {
              tabs.current[i] = b;
            }}
            type="button"
            className="thumb"
            role="tab"
            id={id(i, 'tab')}
            aria-controls={id(panelOf(i), 'panel')}
            aria-selected={i === cur}
            tabIndex={i === cur ? 0 : -1}
            onClick={() => choose(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {s.kind === 'drawing' ? (
              <ProductPlate kind={kind} tone={tone} view={goods ? s.view : undefined} stitch={stitch} />
            ) : s.kind === 'cad' ? (
              <span className="ti d">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" loading="lazy" />
              </span>
            ) : (
              <span className="ti r">
                <Image src={s.src!} alt="" fill sizes="52px" />
              </span>
            )}
            <span>
              <b>{s.b}</b>
              <small>{s.s}</small>
            </span>
          </button>
        ))}
      </div>
      {copy.note && <p className="gnote">{copy.note}</p>}
    </div>
  );
}
