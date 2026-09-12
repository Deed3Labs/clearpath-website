import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* The style guide's colour and type values, read from the files the site is
 * built from — never retyped into the guide.
 *
 * A brand page that lists hex values by hand is wrong the first time someone
 * adjusts a token, and nobody notices, because the page still looks fine. So
 * this parses lib/tokens.css (and the ink band's rebinds in globals.css) at
 * build time. Asking for a token that does not exist throws, which fails the
 * build: the guide cannot describe a colour the site does not have.
 *
 * Server-only. It reads the filesystem, so it runs during static generation. */

const root = process.cwd();
const tokensCss = readFileSync(join(root, 'lib/tokens.css'), 'utf8');
const globalsCss = readFileSync(join(root, 'app/globals.css'), 'utf8');

function readVars(css: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6}|rgb\([^)]*\))/g)) {
    if (!out.has(m[1])) out.set(m[1], m[2]);
  }
  return out;
}

const base = readVars(tokensCss);

/* The dark band rebinds a subset of tokens to lighter values. Only that one
   rule block is read, so a stray custom property elsewhere cannot leak in. */
const inkBlock = globalsCss.match(/\.hx-band\[data-tone='ink'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
const onInk = readVars(inkBlock);

export type RGB = { r: number; g: number; b: number; a: number };

function parse(value: string): RGB {
  if (value.startsWith('#')) {
    const n = parseInt(value.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const [r, g, b, a] = value.replace(/rgb\(|\)/g, '').split(/[\s/]+/).filter(Boolean).map(Number);
  return { r, g, b, a: a ?? 1 };
}

/* An alpha tint means nothing on its own — what a reader sees, and what a
   printer needs, is the tint laid over the ground. */
function over(c: RGB, ground: RGB): RGB {
  const mix = (f: number, g: number) => Math.round(f * c.a + g * (1 - c.a));
  return { r: mix(c.r, ground.r), g: mix(c.g, ground.g), b: mix(c.b, ground.b), a: 1 };
}

const hex = (c: RGB) => '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();

/* WCAG 2 relative luminance and contrast. */
function lum({ r, g, b }: RGB) {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
export function contrast(a: RGB, b: RGB) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* A naive device conversion. It is labelled as an approximation on the page
   for a reason: real print colour depends on the stock and the press profile,
   and the only honest number is the one on a proof. */
function cmyk({ r, g, b }: RGB) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return [0, 0, 0, 100];
  return [(1 - R - k) / (1 - k), (1 - G - k) / (1 - k), (1 - B - k) / (1 - k), k].map((v) => Math.round(v * 100));
}

function token(name: string): string {
  const v = base.get(name);
  if (!v) throw new Error(`brandTokens: --${name} is not defined in lib/tokens.css`);
  return v;
}

const PAPER = parse(token('color-paper'));
const GROUND = parse(token('color-ink-ground'));

export type Swatch = {
  token: string;
  hex: string;
  rgb: string;
  cmyk: string;
  /* Contrast against the two grounds the brand actually uses. */
  onPaper: number;
  onInk: number;
  /* For tints: the value as it lands on paper. */
  composite: boolean;
};

export function swatch(name: string): Swatch {
  const raw = parse(token(name));
  const solid = raw.a < 1 ? over(raw, PAPER) : raw;
  return {
    token: `--${name}`,
    hex: hex(solid),
    rgb: `${solid.r} ${solid.g} ${solid.b}`,
    cmyk: cmyk(solid).map((v, i) => `${'CMYK'[i]}${v}`).join(' '),
    onPaper: contrast(solid, PAPER),
    onInk: contrast(raw.a < 1 ? over(raw, GROUND) : raw, GROUND),
    composite: raw.a < 1,
  };
}

/* The dark-ground counterpart of a token, if the ink band rebinds it. */
export function inkSwatch(name: string): { hex: string; onInk: number } | null {
  const v = onInk.get(name);
  if (!v) return null;
  const c = parse(v);
  const solid = c.a < 1 ? over(c, GROUND) : c;
  return { hex: hex(solid), onInk: contrast(solid, GROUND) };
}

export function scale(prefix: 'spacing' | 'radius'): { token: string; value: string }[] {
  return [...tokensCss.matchAll(new RegExp(`--(${prefix}-[\\w-]+):\\s*([^;*]+);`, 'g'))]
    .filter((m) => !m[1].endsWith('*'))
    .map((m) => ({ token: `--${m[1]}`, value: m[2].trim() }));
}
