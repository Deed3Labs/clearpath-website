import type { PlateArt, PlateTone } from '@/content/shop';

/* Which print a printed tee's plate draws, by the colour's tone: the art for
   dark tees (Black, Cobalt: tone ink) or for the White tee (paper). A dark
   one is drawn with its body filled. Plain functions, so the tests run them. */
export const isDarkPrint = (art: PlateArt | undefined, tone: PlateTone) => !!art?.print && tone !== 'paper';

/* The fill of a dark printed tee's body: its colour's own swatch (Cobalt
   reads blue, Black near-black), else the plate's line colour. Nothing for
   a White tee, or a plate without a print, which are not filled. */
export const bodyFill = (art: PlateArt | undefined, tone: PlateTone, swatch?: string) => (isDarkPrint(art, tone) ? swatch : undefined);

export function printSrc(art: PlateArt | undefined, tone: PlateTone): string | null {
  if (!art?.print) return null;
  return isDarkPrint(art, tone) ? art.print.src.ink : art.print.src.paper;
}
