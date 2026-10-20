import type { Colour, PlateArt, PlateTone } from '@/content/shop';

/* Which print a printed tee's plate draws, by the colour's tone: the art for
   dark tees (Black, Cobalt: tone ink, on the dark ground) or for the White
   tee (paper). Plain functions, so the tests run them. */
export const isDarkPrint = (art: PlateArt | undefined, tone: PlateTone) => !!art?.print && tone !== 'paper';

/* A colour its plate ground cannot show (Cobalt) is drawn with the body
   filled in its swatch; every other colour is drawn as the other goods are,
   on its tone's ground. */
export const fillOf = (colour: Pick<Colour, 'swatch' | 'fill'> | undefined) => (colour?.fill ? colour.swatch : undefined);

export function printSrc(art: PlateArt | undefined, tone: PlateTone): string | null {
  if (!art?.print) return null;
  return isDarkPrint(art, tone) ? art.print.src.ink : art.print.src.paper;
}
