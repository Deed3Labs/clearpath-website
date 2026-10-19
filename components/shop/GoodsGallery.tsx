'use client';

import { GALLERY, type GoodsKind, type Media, type PlateTone } from '@/content/shop';
import { useColour } from './ColourContext';
import { ProductGallery } from './ProductGallery';

/* A goods product's gallery: its renders and mockups in the colour picked
   (ColourContext), the drawing on that colour's ground, and the drawing's
   three views. A product with no colours shows its own tone. */
export function GoodsGallery({
  slug,
  kind,
  tone,
  media,
  stitch,
  patch,
  back,
}: {
  slug: string;
  kind: GoodsKind;
  tone: PlateTone;
  media: Media[];
  stitch: boolean;
  /* The product's own detail naming its patch, e.g. "Embroidered patch". */
  patch: string;
  /* What is on the back, e.g. "Nothing on it". */
  back: string;
}) {
  const picked = useColour();
  return (
    <ProductGallery
      slug={slug}
      kind={kind}
      tone={picked?.colour.tone ?? tone}
      media={media}
      colour={picked?.colour.id}
      stitch={stitch}
      copy={{ label: GALLERY.label, render: GALLERY.render, drawing: GALLERY.drawing, mock: GALLERY.mock, cad: '', note: media.length ? GALLERY.note : '' }}
      drawing={[
        { b: GALLERY.front.b, s: GALLERY.front.s },
        { b: GALLERY.mark.b, s: patch },
        { b: GALLERY.back.b, s: back },
      ]}
    />
  );
}
