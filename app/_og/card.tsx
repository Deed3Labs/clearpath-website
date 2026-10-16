import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/* The card every shared link renders as. Type-led, like the hero it is taken
 * from — the headline does the work and nothing sits beside it. A page may
 * add a kicker (its own label, "For shops · Tools") at the right of the top
 * row; without one the card is the site's.
 *
 * The two faces are committed as static, subset TTFs here in app/_og rather
 * than fetched at build time, so a build never depends on Google Fonts being
 * up. Bricolage ships as a variable font and Satori renders a variable font
 * at its default instance, which is weight 400; it is pinned to 800 in the
 * committed file rather than requested here and silently ignored. The subset
 * covers the headlines in use: a new headline needs its glyphs checked. */

const size = { width: 1200, height: 630 };

const PAPER = '#DFE3DE';
const INK = '#16211D';
const INK_50 = '#6E7672';

export async function renderCard(headline: string, kicker?: string) {
  const dir = join(process.cwd(), 'app', '_og');
  const [display, mono] = await Promise.all([
    readFile(join(dir, 'bricolage-800.ttf')),
    readFile(join(dir, 'plex-mono-400.ttf')),
  ]);

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* The mark, solid variant — at this size the outline would be a
          hairline. Geometry matches components/marks/Logo.tsx. */}
      <svg width="34" height="34" viewBox="-164 -164 328 328">
        <path
          d="M 148.28 -64 A 161.5 161.5 0 1 0 148.28 64 L 74.22 64 A 98 98 0 1 1 74.22 -64 Z"
          fill={INK}
          stroke={INK}
          strokeWidth="4"
        />
        <path d="M 0 -8 H 114 V 8 H 0 Z" fill={INK} />
        <circle cx="0" cy="0" r="34" fill={INK} />
        <circle cx="131.5" cy="0" r="25.25" fill="none" stroke={INK} strokeWidth="15.5" />
      </svg>
      <div style={{ fontFamily: 'Display', fontSize: 30, letterSpacing: '-0.035em' }}>Clear</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          color: INK,
          padding: 72,
        }}
      >
        {kicker ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {brand}
            <div style={{ fontFamily: 'Mono', fontSize: 21, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_50 }}>{kicker}</div>
          </div>
        ) : (
          brand
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Display',
            fontSize: 92,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
          }}
        >
          {/* One sentence; Satori wraps it inside the card's measure. */}
          <div>{headline}</div>
        </div>

        <div
          style={{
            display: 'flex',
            borderTop: `1px solid ${INK_50}`,
            paddingTop: 20,
            fontFamily: 'Mono',
            fontSize: 21,
            color: INK_50,
          }}
        >
          A member-owned cooperative · Inland Empire, California
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Display', data: display, style: 'normal', weight: 800 },
        { name: 'Mono', data: mono, style: 'normal', weight: 400 },
      ],
    },
  );
}
