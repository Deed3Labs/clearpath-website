# Regenerates the outlined lockup SVGs in public/brand.
#
# Needs fonttools, brotli and uharfbuzz, which are NOT project dependencies:
#   python3 -m venv .venv-brand && .venv-brand/bin/pip install fonttools brotli uharfbuzz
# Then, after a build (next/font writes the font files into .next/static/media):
#   .venv-brand/bin/python scripts/brand/generate-lockup.py .next/static/media public/brand
# Given a directory, the script finds the Bricolage file that contains the
# glyphs for "Clear" itself. Rasterise the PNGs with sharp at 2400px wide.

"""Outline the Clear lockup from the exact font the site ships.

Mirrors components/marks/Logo.tsx:
  mark size S; font-size 0.95 S; weight 800; letter-spacing -0.035em;
  line-height 1; gap 0.55em; the mark and the one-line text box centred on
  each other (flex, align-items: center).
Shaping uses HarfBuzz with the browser's default features, so kerning is the
font's own, not an approximation. Optical size 96: the downloadable lockup is
for display sizes, where the browser itself resolves Bricolage to opsz 96.
"""
import json, sys, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

import glob, os
SRC, OUT = sys.argv[1], sys.argv[2]

def find_font(path):
    # A woff2 is compressed, so its family name cannot be grepped; open each
    # candidate and read its name table instead.
    if os.path.isfile(path):
        return path
    for f in sorted(glob.glob(os.path.join(path, '*.woff2'))):
        t = TTFont(f)
        if 'Bricolage' in (t['name'].getDebugName(1) or '') and all(ord(c) in t.getBestCmap() for c in 'Clear'):
            return f
    raise SystemExit(f'No Bricolage font with the glyphs for "Clear" found in {path}. Run a build first.')

WOFF2 = find_font(SRC)
LOC = {'wght': 800, 'opsz': 96, 'wdth': 100}
INK, PAPER = '#16211D', '#DFE3DE'

tt = TTFont(WOFF2)
tt.flavor = None
ttf = io.BytesIO(); tt.save(ttf); data = ttf.getvalue()
upm = tt['head'].unitsPerEm
asc, desc = tt['OS/2'].sTypoAscender, tt['OS/2'].sTypoDescender  # USE_TYPO_METRICS is set
order = tt.getGlyphOrder()
gs = tt.getGlyphSet(location=LOC)

face = hb.Face(data); font = hb.Font(face); font.set_variations(LOC)
buf = hb.Buffer(); buf.add_str('Clear'); buf.guess_segment_properties()
hb.shape(font, buf, {'kern': True, 'liga': True, 'clig': True, 'calt': True})

S = 328.0                 # mark size = the mark's own viewBox, so its geometry stays native
F = 0.95 * S              # font-size
G = 0.55 * F              # gap
k = F / upm               # font units -> px
LS = -0.035 * upm         # letter-spacing in font units, after every character

# Text line box: height F (line-height 1). Content area is asc-desc tall and
# centred in it, so the baseline sits (F - (asc-desc)k)/2 + asc*k from its top.
text_top = (S - F) / 2
baseline = text_top + (F - (asc - desc) * k) / 2 + asc * k
x_text = S + G

paths, pens, x = [], [], 0.0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    p = SVGPathPen(gs); gs[name].draw(p)
    b = BoundsPen(gs); gs[name].draw(b)
    ox = x_text + (x + pos.x_offset) * k
    paths.append((name, p.getCommands(), ox))
    pens.append({'glyph': name, 'penX': round(ox, 3), 'bounds': b.bounds})
    x += pos.x_advance + LS

# Mark geometry, identical to Logo.tsx, centred at (S/2, S/2).
C = 'M 148.28 -64 A 161.5 161.5 0 1 0 148.28 64 L 74.22 64 A 98 98 0 1 1 74.22 -64 Z'
def mark(color, solid):
    return (f'<g transform="translate({S/2} {S/2})" fill="none" stroke="{color}">'
            f'<path d="{C}" stroke-width="4"{f" fill=\"{color}\"" if solid else ""}/>'
            f'<path d="M 0 -8 H 114 V 8 H 0 Z" fill="{color}" stroke="none"/>'
            f'<circle cx="0" cy="0" r="34" fill="{color}" stroke="none"/>'
            f'<circle cx="131.5" cy="0" r="25.25" stroke-width="15.5"/></g>')

# Ink bounds: mark spans -164..164.5 around its centre; the text's right edge is
# the last glyph's outline, not its advance, so trailing letter-spacing is not
# carried into the artwork.
last = pens[-1]
right = last['penX'] + last['bounds'][2] * k
left, top, bottom = S/2 - 164, S/2 - 164, S/2 + 164.5
M = 8
vx, vy, vw, vh = left - M, top - M, (right - left) + 2*M, (bottom - top) + 2*M

def svg(color, solid):
    glyphs = ''.join(
        f'<path transform="translate({ox:.3f} {baseline:.3f}) scale({k:.6f} {-k:.6f})" d="{d}"/>'
        for _, d, ox in paths)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:.3f} {vy:.3f} {vw:.3f} {vh:.3f}" '
            f'width="{vw:.0f}" height="{vh:.0f}" role="img" aria-label="Clear">\n'
            f'  <!-- Clear lockup. Wordmark outlined from Bricolage Grotesque ExtraBold, opsz 96,\n'
            f'       shaped with the font\'s own kerning, tracking -0.035em. Generated, not drawn. -->\n'
            f'  {mark(color, solid)}\n  <g fill="{color}">{glyphs}</g>\n</svg>\n')

files = {
  'clear-lockup-ink.svg': svg(INK, False),
  'clear-lockup-paper.svg': svg(PAPER, False),
  'clear-lockup-solid-ink.svg': svg(INK, True),
  'clear-lockup-solid-paper.svg': svg(PAPER, True),
}
for n, s in files.items():
    open(f'{OUT}/{n}', 'w').write(s)

print(json.dumps({'S': S, 'F': round(F, 3), 'G': round(G, 3), 'baseline': round(baseline, 3),
                  'textTop': round(text_top, 3), 'viewBox': [round(v, 3) for v in (vx, vy, vw, vh)],
                  'glyphs': [{'g': p['glyph'], 'penX': p['penX']} for p in pens],
                  'files': list(files)}, indent=1))
