/* Regenerates the mark and avatar files in public/brand from the geometry in
 * components/marks/Logo.tsx. Run from the repo root:
 *   node scripts/brand/generate-marks.mjs public/brand
 * Needs only sharp, which is already a dependency. */

import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = resolve(process.argv[2]);
const INK = '#16211D', PAPER = '#DFE3DE';
// Same path data as components/marks/Logo.tsx — the single source for the geometry.
const C = 'M 148.28 -64 A 161.5 161.5 0 1 0 148.28 64 L 74.22 64 A 98 98 0 1 1 74.22 -64 Z';

function mark(color, variant, { ground = null, canvas = 328, markSize = 328 } = {}) {
  const pad = (canvas - markSize) / 2;
  const scale = markSize / 328;
  const solid = variant === 'solid';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas} ${canvas}" width="${canvas}" height="${canvas}" role="img" aria-label="Clear">
${ground ? `  <rect width="${canvas}" height="${canvas}" fill="${ground}"/>\n` : ''}  <g transform="translate(${pad + 164 * scale} ${pad + 164 * scale}) scale(${scale})" fill="none" stroke="${color}">
    <path d="${C}" stroke-width="4"${solid ? ` fill="${color}"` : ''}/>
    <path d="M 0 -8 H 114 V 8 H 0 Z" fill="${color}" stroke="none"/>
    <circle cx="0" cy="0" r="34" fill="${color}" stroke="none"/>
    <circle cx="131.5" cy="0" r="25.25" stroke-width="15.5"/>
  </g>
</svg>
`;
}

const files = [];
const svg = (name, s) => { writeFileSync(`${OUT}/${name}`, s); files.push(name); };
const png = async (name, s, size) => { await sharp(Buffer.from(s)).resize(size, size).png().toFile(`${OUT}/${name}`); files.push(name); };

// Vector marks — outline for 96px / 15mm and up, solid below.
// The ring's outer edge reaches x = 164.5 in a 164-unit half-width, so a
// canvas the exact size of the mark clips it by half a unit. 4 units of margin.
const M = { canvas: 336, markSize: 328 };
svg('clear-mark-ink.svg', mark(INK, 'outline', M));
svg('clear-mark-paper.svg', mark(PAPER, 'outline', M));
svg('clear-mark-solid-ink.svg', mark(INK, 'solid', M));
svg('clear-mark-solid-paper.svg', mark(PAPER, 'solid', M));

// Raster marks on transparent ground.
await png('clear-mark-ink.png', mark(INK, 'outline', { canvas: 1024, markSize: 1000 }), 1024);
await png('clear-mark-paper.png', mark(PAPER, 'outline', { canvas: 1024, markSize: 1000 }), 1024);

// Social avatars: the mark on a ground, padded so a circular crop never clips it.
await png('clear-avatar-ink.png', mark(PAPER, 'outline', { ground: INK, canvas: 1080, markSize: 600 }), 1080);
await png('clear-avatar-paper.png', mark(INK, 'outline', { ground: PAPER, canvas: 1080, markSize: 600 }), 1080);

console.log(files.join('\n'));
