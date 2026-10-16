import { OG } from '@/content/shopsTools';
import { renderCard } from '../../_og/card';

/* /shops/tools's card: its own headline, with the page's label. */

export const alt = `${OG.headline} — Clear, a member-owned cooperative`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return renderCard(OG.headline, OG.kicker);
}
