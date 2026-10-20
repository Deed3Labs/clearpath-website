import type { PlateArt, PlateTone } from '@/content/shop';

/* Which print a printed tee's plate draws, by the colour's tone: the art for
   dark tees (Black, Cobalt: tone ink) or for the White tee (paper). A dark
   one is drawn with its body filled. Plain functions, so the tests run them. */
export const isDarkPrint = (art: PlateArt | undefined, tone: PlateTone) => !!art?.print && tone !== 'paper';

export function printSrc(art: PlateArt | undefined, tone: PlateTone): string | null {
  if (!art?.print) return null;
  return isDarkPrint(art, tone) ? art.print.src.ink : art.print.src.paper;
}
