import { HERO } from '@/content/home';
import { renderCard } from './_og/card';

/* The site's card: the home headline. The card itself is app/_og/card.tsx. */

export const alt = `${HERO.headline} — Clear, a member-owned cooperative`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return renderCard(HERO.headline);
}
