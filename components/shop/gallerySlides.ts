import type { Media } from '@/content/shop';

/* A product gallery's slides, in order. Plain functions (no React), so the
 * tests can run them. ProductGallery renders what this returns.
 *
 * - Goods: the pictures of the colour or variant picked (mockups), then the
 *   drawing's three views, then the pictures for every choice (the patch's
 *   pair), then any renders.
 * - Hardware: the renders, its one drawing, then the CAD sheets.
 *
 * A picture with a `colour` or `variant` shows only while that one is
 * picked; its key is its kind and place among them ("mock:0"), so the frame
 * stays on the same picture when the choice changes. */

export type PlateView = 'front' | 'mark' | 'back';
export type SlideKind = 'render' | 'drawing' | 'mock' | 'cad';

export type Slide = {
  key: string;
  kind: SlideKind;
  b: string;
  s: string;
  cap: string;
  src?: string;
  alt?: string;
  view?: PlateView;
};

export type SlideCopy = { render: string; drawing: string; mock: string; cad: string };

export function gallerySlides(
  media: Media[],
  pick: { colour?: string; variant?: string },
  copy: SlideCopy,
  drawing: { b: string; s: string }[],
): Slide[] {
  const goods = drawing.length === 3;
  const word = (k: Media['kind']) => (k === 'render' ? copy.render : k === 'mock' ? copy.mock : copy.cad);
  const shows = (m: Media) =>
    (!m.colour || !pick.colour || m.colour === pick.colour) && (!m.variant || !pick.variant || m.variant === pick.variant);
  const tagged = (m: Media) => !!(m.colour || m.variant);
  const of = (k: Media['kind'], which: 'tagged' | 'untagged' | 'all') => {
    let n = 0;
    return media
      .filter((m) => m.kind === k && shows(m) && (which === 'all' || tagged(m) === (which === 'tagged')))
      .map<Slide>((m) => ({
        key: tagged(m) ? `${k}:${n++}` : m.src,
        kind: k,
        b: word(k),
        s: m.caption,
        cap: `${word(k)} · ${m.caption}`,
        src: m.src,
        alt: m.alt,
      }));
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
  return goods
    ? [...of('mock', 'tagged'), ...drawn, ...of('mock', 'untagged'), ...of('render', 'all')]
    : [...of('render', 'all'), ...drawn, ...of('cad', 'all')];
}

/* The shape the patch's drawing takes for a variant: round for the circle,
   square for everything else, every garment's patch included. */
export const patchShapeOf = (kind: string, variant?: string): 'square' | 'circle' =>
  kind === 'patch' && variant === 'circle' ? 'circle' : 'square';
