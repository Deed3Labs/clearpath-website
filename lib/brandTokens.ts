import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* The style guide's colour and type values, read from the files the site is
 * built from — never retyped into the guide.
 *
 * A brand page that lists hex values by hand is wrong the first time someone
 * adjusts a token, and nobody notices, because the page still looks fine. So
 * this parses lib/tokens.css (and the ink band's rebinds in app/styles/system.css) at
 * build time. Asking for a token that does not exist throws, which fails the
 * build: the guide cannot describe a colour the site does not have.
 *
 * Server-only. It reads the filesystem, so it runs during static generation. */

const root = process.cwd();
const tokensCss = readFileSync(join(root, 'lib/tokens.css'), 'utf8');
const globalsCss = readFileSync(join(root, 'app/globals.css'), 'utf8');
const systemCss = readFileSync(join(root, 'app/styles/system.css'), 'utf8');

function readVars(css: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6}|rgb\([^)]*\))/g)) {
    if (!out.has(m[1])) out.set(m[1], m[2]);
  }
  return out;
}

const base = readVars(tokensCss);

/* The dark band rebinds a subset of tokens to lighter values. Only the band's
   own rule blocks are read, so a stray custom property elsewhere cannot leak
   in: the shared one (.band-ink and .hx-band[data-tone='ink'] together) and
   the old band's extra raised surface. A missing block fails the build, so
   the guide cannot quietly drop its on-ink column again. */
const bandBlock = systemCss.match(/\.band-ink,\s*\n\.hx-band\[data-tone='ink'\]\s*\{([\s\S]*?)\n\}/)?.[1];
const raisedBlock = systemCss.match(/\n\.hx-band\[data-tone='ink'\] \{ (--color-paper-2:[^}]*)\}/)?.[1];
if (!bandBlock || !raisedBlock) throw new Error('brandTokens: the ink band rules are missing from app/styles/system.css');
const onInk = readVars(bandBlock + raisedBlock);

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

/* The product's dense scale, --d1 to --d5, from :root in tokens.css. */
export function denseScale(): { token: string; value: string }[] {
  const steps = [...tokensCss.matchAll(/--(d\d):\s*([^;]+);/g)].map((m) => ({ token: `--${m[1]}`, value: m[2].trim() }));
  if (!steps.length) throw new Error('brandTokens: --d1 to --d5 are not defined in lib/tokens.css');
  return steps;
}

/* ── The live dot ──────────────────────────────────────────────────────────
   Its construction, read from globals.css the same way the colours are read
   from tokens.css. If the dot's CSS changes shape, a value goes missing and
   the build fails rather than the guide describing a dot that no longer
   exists. */

function block(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = globalsCss.match(new RegExp(`(?:^|\\n)${esc}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!m) throw new Error(`brandTokens: ${selector} not found in app/globals.css`);
  return m[1];
}

function prop(css: string, name: string, where: string): string {
  const m = css.match(new RegExp(`(?:^|\\n)\\s*${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`brandTokens: ${name} missing from ${where}`);
  return m[1].trim();
}

function glow(shadow: string, where: string) {
  const m = shadow.match(/0 0 (\d+)px(?: (\d+)px)? color-mix\(in srgb, var\(--dot\) (\d+)%/);
  if (!m) throw new Error(`brandTokens: unexpected glow in ${where}: ${shadow}`);
  return { blur: `${m[1]}px`, spread: m[2] ? `${m[2]}px` : '0', strength: `${m[3]}%` };
}

export type DotSpec = {
  button: { size: string; gap: string; glow: { blur: string; spread: string; strength: string } };
  chip: { size: string; gap: string; glow: { blur: string; spread: string; strength: string } };
  ping: { duration: string; easing: string; from: { scale: string; opacity: string }; to: { scale: string; opacity: string }; settlesAt: string };
};

export function dotSpec(): DotSpec {
  const base = block('.live-dot');
  const chip = block('.chip .chip-dot');
  const after = block('.live-dot::after');
  const anim = prop(after, 'animation', '.live-dot::after');
  const am = anim.match(/live-ping\s+([\d.]+s)\s+(cubic-bezier\([^)]*\)|[\w-]+)/);
  if (!am) throw new Error(`brandTokens: unexpected animation: ${anim}`);

  const kf = globalsCss.match(/@keyframes live-ping\s*\{([\s\S]*?)\n\}/)?.[1];
  if (!kf) throw new Error('brandTokens: @keyframes live-ping not found');
  const start = kf.match(/0%\s*\{\s*transform:\s*scale\(([\d.]+)\);\s*opacity:\s*([\d.]+)/);
  const end = kf.match(/(\d+)%,\s*100%\s*\{\s*transform:\s*scale\(([\d.]+)\);\s*opacity:\s*([\d.]+)/);
  if (!start || !end) throw new Error('brandTokens: live-ping keyframes changed shape');

  const pct = (n: string) => `${Math.round(Number(n) * 100)}%`;
  return {
    button: {
      size: prop(base, 'width', '.live-dot'),
      gap: prop(base, 'margin-right', '.live-dot'),
      glow: glow(prop(base, 'box-shadow', '.live-dot'), '.live-dot'),
    },
    chip: {
      size: prop(chip, 'width', '.chip .chip-dot'),
      gap: prop(chip, 'margin-right', '.chip .chip-dot'),
      glow: glow(prop(chip, 'box-shadow', '.chip .chip-dot'), '.chip .chip-dot'),
    },
    ping: {
      duration: am[1],
      easing: am[2],
      from: { scale: pct(start[1]), opacity: pct(start[2]) },
      to: { scale: pct(end[2]), opacity: pct(end[3]) },
      settlesAt: `${end[1]}%`,
    },
  };
}

/* ── More of the system, read the same way ─────────────────────────────── */

/* Any colour, graded against both grounds: what a token resolves to inside
   the ink band, or a value the site draws with that is not a token. */
function swatchOf(c: RGB, label: string): Swatch {
  const solid = c.a < 1 ? over(c, PAPER) : c;
  return {
    token: label,
    hex: hex(solid),
    rgb: `${solid.r} ${solid.g} ${solid.b}`,
    cmyk: cmyk(solid).map((v, i) => `${'CMYK'[i]}${v}`).join(' '),
    onPaper: contrast(solid, PAPER),
    onInk: contrast(c.a < 1 ? over(c, GROUND) : c, GROUND),
    composite: c.a < 1,
  };
}

/* A token as the ink band rebinds it (cobalt on ink, say), as a full swatch.
   Throws if the band does not rebind it. */
export function bandSwatch(name: string): Swatch {
  const v = onInk.get(name);
  if (!v) throw new Error(`brandTokens: the ink band does not rebind --${name}`);
  return swatchOf(parse(v), `--${name} on ink`);
}

/* The quiet trace: faded cobalt light along a line, for pointing at something
   without calling it live. It is not a token; it is drawn once, round the
   investor seats on /capital, so that rule is what the guide reads. */
export function quietTrace(): { halo: Swatch; core: Swatch } {
  const css = readFileSync(join(root, 'app/capital/page.css'), 'utf8');
  const stroke = (part: 'halo' | 'core') => {
    const m = css.match(new RegExp(`#seats-h \\.trace \\.${part} \\{ stroke: (#[0-9a-fA-F]{6})`));
    if (!m) throw new Error(`brandTokens: the quiet trace's ${part} is missing from app/capital/page.css`);
    return swatchOf(parse(m[1]), `quiet ${part}`);
  };
  return { halo: stroke('halo'), core: stroke('core') };
}

/* A tint token's raw value and its strength: "rgb(22 33 29 / .28)", 28. */
export function tint(name: string): { value: string; pct: number } {
  const v = token(name);
  return { value: v, pct: Math.round(parse(v).a * 100) };
}

/* One value from either scale, by token: radius('device') → "14px". */
export function radius(name: string): string {
  const r = scale('radius').find((s) => s.token === `--radius-${name}`);
  if (!r) throw new Error(`brandTokens: --radius-${name} is not defined in lib/tokens.css`);
  return r.value;
}

/* The one ease everything moves on. */
export function ease(): string {
  const m = tokensCss.match(/\n\s*--ease:\s*([^;]+);/);
  if (!m) throw new Error('brandTokens: --ease is not defined in lib/tokens.css');
  return m[1].trim();
}

/* A file the guide offers for download. It must exist in public/, or the
   build fails; a PNG's pixel width is read from its own header, so the label
   beside the link cannot claim a size the file does not have. */
export function download(href: string): { href: string; width: number | null } {
  if (!href.startsWith('/')) throw new Error(`brandTokens: download ${href} is not a site path`);
  const buf = readFileSync(join(root, 'public', href));
  const png = buf.subarray(1, 4).toString('latin1') === 'PNG';
  return { href, width: png ? buf.readUInt32BE(16) : null };
}

/* The page measure: the widest the content runs (--max in the shared system). */
export function measure(): string {
  const m = systemCss.match(/\n\s*--max:\s*([^;]+);/);
  if (!m) throw new Error('brandTokens: --max is not defined in app/styles/system.css');
  return m[1].trim();
}
