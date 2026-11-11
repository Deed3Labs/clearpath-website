/* The Clear Card in three.js, built from the Rev C numbers: back, core
 * (with the chip pocket), chip, face. Ported from
 * docs/card-section/reference/card-section.html, the "type=module" script.
 *
 * The page side (ClearCard.tsx) owns the scroll and writes progress into
 * window.clearCard.p. Steps 01–04 run over the first 80% of it; in 05 the
 * card comes round to its face and taps a door reader. Here, scroll only sets TARGETS; every moving part
 * follows its target on a spring, so the card has weight: it lags a fast
 * scroll, settles, and the sheets land with a small bounce.
 *
 * Loaded with import() only when the section comes near the screen, so
 * three.js and the textures never hold up the hero. mountCardScene returns
 * a cleanup that stops the loop and frees the GPU, for leaving the page. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { CardEdition } from '@/content/home';

export type CardState = {
  p: number;
  ed: CardEdition;
  chipOn: boolean;
  setEdition?: (ed: CardEdition) => void;
  setChip?: (on: boolean) => void;
};

declare global {
  interface Window {
    clearCard?: CardState;
  }
}

/* Where the textures are served from (public/card). */
const BASE = '/card/';

type Mat = THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
type Uniforms = {
  uSheen: { value: number };
  uPulse: { value: number };
  uChip: { value: THREE.Vector2 };
  uPulseCol: { value: THREE.Color };
  uPower: { value: number };
  uLive: { value: number };
  uFront: { value: number };
  uLiveCol: { value: THREE.Color };
  uDead: { value: number };
  uWood: { value: THREE.Color };
  uClear: { value: number };
};

export function mountCardScene(view: HTMLElement, labelsEl: HTMLElement): () => void {
  const C = window.clearCard!;
  let r: THREE.WebGLRenderer;
  try {
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    view.classList.add('nogl');
    return () => {};
  }
  /* Phones and tablets draw at 1.5x, not 2x: about 44% fewer pixels a
     frame, hard to tell apart at that size, and the scene's fill cost is
     what made scrolling past it stutter there. */
  const small = matchMedia('(pointer: coarse), (max-width: 1000px)').matches;
  r.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.VSMShadowMap;
  r.setClearColor(0, 0);
  view.insertBefore(r.domElement, view.firstChild);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(r);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  /* three 0.160 has the property; its types do not yet. */
  (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.62;
  const key = new THREE.DirectionalLight(0xfff4e6, 2.0);
  key.position.set(-50, 80, 230);
  key.castShadow = true;
  /* the soft shadow is re-blurred every frame; on small screens a smaller
     map with the radius scaled to match keeps the same softness for under
     half the work */
  key.shadow.mapSize.setScalar(small ? 512 : 768);
  key.shadow.radius = small ? 8 : 12;
  key.shadow.blurSamples = small ? 8 : 10;
  key.shadow.bias = -0.002;
  Object.assign(key.shadow.camera, { left: -160, right: 160, top: 160, bottom: -160, near: 20, far: 500 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(80, -160, 80);
  scene.add(fill);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.ShadowMaterial({ opacity: 0.085 }));
  wall.position.z = -46;
  wall.receiveShadow = true;
  scene.add(wall);
  const cam = new THREE.PerspectiveCamera(24, 1, 1, 2000);

  /* ── Geometry, in millimetres ───────────────────────────────────────── */
  const W = 85.6, H = 53.98, R = 3.18, T = 0.8, FILM = 0.05;
  const CXmm = 85.6 - 3 - 27.2 / 2, CX = CXmm - W / 2, POCKET = 27.2 / 2, CHIP = 27 / 2;
  function outline() {
    const s = new THREE.Shape(), x = -W / 2, y = -H / 2, P = Math.PI;
    s.moveTo(x + R, y);
    s.lineTo(x + W - R, y);
    s.absarc(x + W - R, y + R, R, -P / 2, 0, false);
    s.lineTo(x + W, y + H - R);
    s.absarc(x + W - R, y + H - R, R, 0, P / 2, false);
    s.lineTo(x + R, y + H);
    s.absarc(x + R, y + H - R, R, P / 2, P, false);
    s.lineTo(x, y + R);
    s.absarc(x + R, y + R, R, P, P * 1.5, false);
    return s;
  }
  /* One sheet. Groups: 0 its top face, 1 its bottom face, 2 the cut edge. */
  function sheet(hole: boolean, mirror: boolean) {
    const s = outline();
    if (hole) {
      const h = new THREE.Path();
      h.absarc(CX, 0, POCKET, 0, Math.PI * 2, true);
      s.holes.push(h);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 32 });
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const u = (p.getX(i) + W / 2) / W;
      uv.setXY(i, mirror ? 1 - u : u, (p.getY(i) + H / 2) / H);
    }
    const n = g.attributes.normal, top: number[] = [], bot: number[] = [], side: number[] = [];
    for (let i = 0; i < p.count; i += 3) {
      const z = n.getZ(i);
      (z > 0.5 ? top : z < -0.5 ? bot : side).push(i, i + 1, i + 2);
    }
    g.setIndex([...top, ...bot, ...side]);
    g.clearGroups();
    g.addGroup(0, top.length, 0);
    g.addGroup(top.length, bot.length, 1);
    g.addGroup(top.length + bot.length, side.length, 2);
    return g;
  }

  /* ── Materials ──────────────────────────────────────────────────────── */
  const loader = new THREE.TextureLoader(), cache: Record<string, Promise<THREE.Texture>> = {};
  const aniso = Math.min(8, r.capabilities.getMaxAnisotropy());
  function tex(name: string, color = true) {
    if (!cache[name])
      cache[name] = loader.loadAsync(BASE + name).then((t) => {
        if (color) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = aniso;
        return t;
      });
    return cache[name];
  }
  const wood = () => new THREE.MeshPhysicalMaterial({ roughness: 0.84, metalness: 0, specularIntensity: 0.35, bumpScale: 1.2 });
  const edge = () => new THREE.MeshStandardMaterial({ roughness: 0.8 });
  /* The two engraved faces carry two light effects, both drawn in the
     shader: a sheen that glances across the wood, and a pulse that runs out
     from the chip through the engraved rings. */
  function engraved(chipMm: [number, number], name: string, m: Mat = wood(), shared?: Uniforms) {
    const see = m.transparent;
    const u: Uniforms = shared ?? {
      uSheen: { value: -2 },
      uPulse: { value: -99 },
      uChip: { value: new THREE.Vector2(...chipMm) },
      uPulseCol: { value: new THREE.Color(1, 0.62, 0.26) },
      uPower: { value: 0 },
      uLive: { value: 0 },
      uFront: { value: 0 },
      uLiveCol: { value: new THREE.Color(1, 0.62, 0.26) },
      uDead: { value: 0 },
      uWood: { value: new THREE.Color(0xecd6ae) },
      uClear: { value: 0 },
    };
    m.userData.u = u;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uSheen; uniform float uPulse; uniform vec2 uChip; uniform vec3 uPulseCol; uniform float uPower; uniform float uLive; uniform float uFront; uniform vec3 uLiveCol; uniform float uDead; uniform vec3 uWood; uniform float uClear;',
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
#ifdef USE_MAP
  float eng = 0.0;
  #ifdef USE_BUMPMAP
    eng = 1.0 - texture2D(bumpMap, vBumpMapUv).r;
  #endif
  float sd = (vMapUv.x * .86 + vMapUv.y * .5) - uSheen;
  totalEmissiveRadiance += vec3(1.0, .93, .82) * exp(-sd * sd / .0035) * .16;
  vec2 mm = vec2(vMapUv.x * 85.6, vMapUv.y * 53.98);
  float pd = length(mm - uChip) - uPulse;
  float wave = exp(-pd * pd / 6.0) * smoothstep(-1.0, 6.0, uPulse) * (1.0 - smoothstep(26.0, 44.0, uPulse));
  totalEmissiveRadiance += uPulseCol * wave * eng * .95;
  /* the chip's state, in its rings. Only the rings and the tap dot sit
     inside 31 mm of the chip, so nothing else on the card changes.
     On: the rings wake one by one from the chip outward (uPower) with a
     bright leading edge (uFront), then keep their own colour, deepened to
     a warm copper that breathes (uLive): coloured, never washed out.
     Off: the colour drains out of them, from the chip outward (uDead),
     until they are the wood around them.
     The Clear edition (uClear 1) has no wood to colour: its rings are
     polished lines in the frost, so on they glow warm through it (the
     reference's light), and off they are just the polished lines. */
  float dc = length(mm - uChip), Rr = uPower * 31.0;
  float lit = 1.0 - smoothstep(Rr - 2.2, Rr, dc);
  float zone = 1.0 - smoothstep(27.5, 31.0, dc);
  float lead = exp(-(dc - Rr) * (dc - Rr) / 3.0) * uFront;
  float on = eng * zone * lit * uLive;
  diffuseColor.rgb *= mix(vec3(1.0), vec3(1.1, .72, .42), on * (1.0 - uClear));
  totalEmissiveRadiance += uLiveCol * (on * mix(.35, 1.7, uClear) + eng * zone * lead * 2.4);
  float Rd = uDead * 31.0;
  float gone = eng * zone * (1.0 - smoothstep(Rd - 2.2, Rd, dc));
  diffuseColor.rgb = mix(diffuseColor.rgb, uWood, gone * .85 * (1.0 - uClear));
#endif`,
        );
      /* see-through sheets (the Clear edition): the polished art is almost
         transparent, so anything lit in it raises its own opacity */
      if (see)
        sh.fragmentShader = sh.fragmentShader.replace(
          '#include <opaque_fragment>',
          `diffuseColor.a = max(diffuseColor.a, clamp(max(max(totalEmissiveRadiance.r, totalEmissiveRadiance.g), totalEmissiveRadiance.b), 0.0, 1.0));
#include <opaque_fragment>`,
        );
    };
    m.customProgramCacheKey = () => name;
    return m;
  }
  const EDGE: Record<string, number> = { birch: 0xecd6ae, 'birch-caramel': 0xb6844f, 'birch-dark': 0x5e3a20 };
  const ED: Record<Exclude<CardEdition, 'clear'>, { face: string; core: string }> = {
    light: { face: 'birch', core: 'birch-caramel' },
    dark: { face: 'birch-dark', core: 'birch-caramel' },
    contrast: { face: 'birch-dark', core: 'birch' },
  };
  const M: Record<'face' | 'core' | 'back', Mat[]> = {
    face: [engraved([CXmm, H / 2], 'face'), wood(), edge()],
    core: [wood(), wood(), edge()],
    back: [wood(), engraved([W - CXmm, H / 2], 'back'), edge()],
  };
  /* The Clear edition: frosted polycarbonate over a smoke-tinted core. One
     map per sheet (white = frosted, dark = the polished art) sets the haze,
     the roughness and, through the shader, which parts light up. The core's
     back side carries the printed code label. Same uniforms as the wood
     faces, so every light effect runs on both. */
  const frost = () =>
    new THREE.MeshPhysicalMaterial({ color: 0xf4f7f5, transparent: true, opacity: 0.6, roughness: 0.55, metalness: 0, specularIntensity: 0.7, envMapIntensity: 0.8, bumpScale: 0 });
  const gloss = (op: number) =>
    new THREE.MeshPhysicalMaterial({ color: 0xf4f7f5, transparent: true, opacity: op, roughness: 0.05, clearcoat: 0.4, clearcoatRoughness: 0.1 });
  const CM: Record<'face' | 'core' | 'back', Mat[]> = {
    face: [engraved([CXmm, H / 2], 'face-clear', frost(), M.face[0].userData.u as Uniforms), gloss(0.08), gloss(0.55)],
    core: [
      new THREE.MeshStandardMaterial({ color: 0x27302c, roughness: 0.6, envMapIntensity: 0.25, transparent: true, opacity: 0.85 }),
      new THREE.MeshStandardMaterial({ roughness: 0.6, envMapIntensity: 0.25, transparent: true }),
      new THREE.MeshPhysicalMaterial({ color: 0x27302c, roughness: 0.15, clearcoat: 0.6, transparent: true, opacity: 0.9 }),
    ],
    back: [gloss(0.08), engraved([W - CXmm, H / 2], 'back-clear', frost(), M.back[1].userData.u as Uniforms), gloss(0.55)],
  };

  const pivot = new THREE.Group(), stack = new THREE.Group();
  pivot.add(stack);
  scene.add(pivot);
  const mesh = (g: THREE.BufferGeometry, m: Mat[]) => {
    const o = new THREE.Mesh(g, m);
    o.castShadow = true;
    o.receiveShadow = true;
    stack.add(o);
    return o;
  };
  const back = mesh(sheet(false, true), M.back), core = mesh(sheet(true, false), M.core), face = mesh(sheet(false, false), M.face);
  function showClear(on: boolean) {
    face.material = on ? CM.face : M.face;
    back.material = on ? CM.back : M.back;
    core.material = on ? CM.core : M.core;
    face.castShadow = back.castShadow = !on; // clear sheets cast almost no shadow; the tinted core does
    core.renderOrder = on ? 1 : 0;
    face.renderOrder = back.renderOrder = on ? 2 : 0; // core first, then the sheets over it
  }

  /* The chip: a dark disc with its coil, sized to the Arx tag. A stand-in,
     not a photo-accurate Arx HaLo. */
  const chip = new THREE.Group();
  stack.add(chip);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(CHIP, CHIP, T, 96), new THREE.MeshStandardMaterial({ color: 0x121715, roughness: 0.55, envMapIntensity: 0.5 }));
  disc.rotation.x = Math.PI / 2;
  disc.position.set(CX, 0, T / 2);
  disc.castShadow = true;
  chip.add(disc);
  const coil = new THREE.MeshStandardMaterial({ color: 0xb08a3e, metalness: 0.85, roughness: 0.32, emissive: 0xffa04a, emissiveIntensity: 0 });
  for (let k = 0; k < 6; k++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(CHIP - 1.6 - k * 0.85, 0.07, 6, 128), coil);
    t.position.set(CX, 0, T + 0.01);
    chip.add(t);
  }
  const die = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.2, 0.12), new THREE.MeshStandardMaterial({ color: 0x1d2420, roughness: 0.4, metalness: 0.3 }));
  die.position.set(CX, 0, T + 0.06);
  chip.add(die);

  /* Security moment: as the chip seats, three cobalt rings close in on it,
     like a lock turning. Drawn flat in the chip's plane, so they read as part
     of the card, not as a graphic laid over it. */
  const ringMat = () =>
    new THREE.MeshBasicMaterial({ color: 0x3a5bd0, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.RingGeometry(1, 1.035, 128), ringMat());
    m.position.set(CX, 0, T + 0.08);
    m.renderOrder = 2;
    chip.add(m);
    return m;
  });

  /* Assembly guides: dashed rules at the four outer corners, drawn only in
     the gaps between sheets (back to core, core to face), like the
     construction lines on an exploded drawing. They fade as it closes. */
  const guideMat = new THREE.LineDashedMaterial({ color: 0x16211d, dashSize: 1.2, gapSize: 1, transparent: true, opacity: 0, depthWrite: false });
  const K = R * (1 - Math.SQRT1_2); // the outermost point of each rounded corner
  const CORN = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [a * (W / 2 - K), b * (H / 2 - K)]);
  const guideGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(CORN.length * 2 * 2 * 3), 3));
  const guides = new THREE.LineSegments(guideGeo, guideMat);
  stack.add(guides);
  function setGuides(zc: number, zf: number) {
    const a = guideGeo.attributes.position;
    let i = 0;
    for (const [x, y] of CORN)
      for (const [z0, z1] of [[T, zc], [zc + T, zf]]) {
        a.setXYZ(i++, x, y, z0);
        a.setXYZ(i++, x, y, z1);
      }
    a.needsUpdate = true;
    guides.computeLineDistances();
  }

  /* ── The reader (step 05): a door reader at a co-work space ───────── */
  /* An ink slab with a glass front. The tap zone is a light ring with the
     contactless mark inside it: it breathes softly while it waits, sweeps
     green around when a live card taps, and blinks red when it's switched off. */
  const RD = { w: 54, h: 86, r: 8, d: 7, x: 30, front: -6.5, cy: 4 };
  const reader = new THREE.Group();
  scene.add(reader);
  const rrect = (w: number, h: number, r: number) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2, P = Math.PI;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -P / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, P / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, P / 2, P, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, P, P * 1.5, false);
    return s;
  };
  {
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rrect(RD.w, RD.h, RD.r), { depth: RD.d, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1.2, bevelSegments: 5, curveSegments: 28 }),
      new THREE.MeshStandardMaterial({ color: 0x18221e, roughness: 0.62, metalness: 0.05 }),
    );
    body.position.z = -RD.d - 1.2;
    body.castShadow = true;
    reader.add(body);
    /* the glass: a darker, glossier panel set into the face */
    const glass = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rrect(RD.w - 7, RD.h - 7, RD.r - 3), { depth: 0.3, bevelEnabled: false, curveSegments: 28 }),
      new THREE.MeshPhysicalMaterial({ color: 0x141d19, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1 }),
    );
    glass.position.z = 0;
    reader.add(glass);
    /* the contactless mark: three arcs opening to the right */
    const markMat = new THREE.MeshBasicMaterial({ color: 0x6f7a75, toneMapped: false });
    [2.6, 4.6, 6.6].forEach((r) => {
      const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.38, 6, 40, 1.35), markMat);
      a.rotation.z = -1.35 / 2;
      a.position.set(-2.6, RD.cy, 0.4);
      reader.add(a);
    });
    /* the track the light runs in */
    const track = new THREE.Mesh(new THREE.RingGeometry(12.4, 13.9, 128), new THREE.MeshBasicMaterial({ color: 0x26312d, toneMapped: false }));
    track.position.set(0, RD.cy, 0.35);
    reader.add(track);
  }
  const ringMatL = new THREE.MeshBasicMaterial({ color: 0x8c9893, toneMapped: false });
  const ringArc = new THREE.Mesh(new THREE.RingGeometry(12.4, 13.9, 128), ringMatL);
  ringArc.position.set(0, RD.cy, 0.4);
  reader.add(ringArc);
  let arcTheta = Math.PI * 2;
  function setArc(theta: number) {
    theta = Math.max(0.001, Math.min(Math.PI * 2, theta));
    if (Math.abs(theta - arcTheta) < 0.01) return;
    arcTheta = theta;
    ringArc.geometry.dispose();
    /* starts at the top and runs clockwise */
    ringArc.geometry = new THREE.RingGeometry(12.4, 13.9, 128, 1, Math.PI / 2 - theta, theta);
  }
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x6fcb9f, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.RingGeometry(9.5, 19, 128), glowMat);
  glow.position.set(0, RD.cy, 0.38);
  reader.add(glow);
  reader.position.set(200, 0, RD.front);
  const LITE = { idle: new THREE.Color(0x8c9893), ok: new THREE.Color(0x6fcb9f), no: new THREE.Color(0xe58c7f), off: new THREE.Color(0x26312d) };
  const _c = new THREE.Color();

  let alive = true;
  async function setEdition(ed: CardEdition) {
    const clear = (M.face[0].userData.u as Uniforms).uClear;
    if (ed === 'clear') {
      const [f, b, c] = await Promise.all([tex('clear-face.jpg', false), tex('clear-back.jpg', false), tex('clear-core.png')]);
      if (!alive || C.ed !== ed) return;
      for (const [m, map] of [
        [CM.face[0], f],
        [CM.back[1], b],
      ] as const) {
        m.map = m.alphaMap = m.roughnessMap = m.bumpMap = map;
        m.needsUpdate = true;
      }
      CM.core[1].map = c;
      CM.core[1].needsUpdate = true;
      clear.value = 1;
      showClear(true);
      ready();
      return;
    }
    const e = ED[ed];
    const [f, b, bf, bb, rf, rc] = await Promise.all([
      tex(`face-${ed}.jpg`),
      tex(`back-${ed}.jpg`),
      tex('bump-face.jpg', false),
      tex(ed === 'light' ? 'bump-back-light.jpg' : 'bump-back-dark.jpg', false),
      tex(`core-${e.face}.jpg`),
      tex(`core-${e.core}.jpg`),
    ]);
    if (!alive || C.ed !== ed) return;
    const set = (m: Mat, map: THREE.Texture, bump?: THREE.Texture) => {
      m.map = map;
      m.bumpMap = bump || null;
      m.needsUpdate = true;
    };
    set(M.face[0], f, bf);
    set(M.face[1], rf);
    set(M.back[1], b, bb);
    set(M.back[0], rf);
    set(M.core[0], rc);
    set(M.core[1], rc);
    M.face[2].color.setHex(EDGE[e.face]);
    M.back[2].color.setHex(EDGE[e.face]);
    /* the wood a switched-off chip's rings fade into */
    for (const m of [M.face[0], M.back[1]]) (m.userData.u as Uniforms).uWood.value.setHex(EDGE[e.face]);
    M.core[2].color.setHex(EDGE[e.core]);
    clear.value = 0;
    showClear(false);
    ready();
  }
  function ready() {
    warm();
    if (!view.classList.contains('ready')) {
      view.classList.remove('nogl');
      view.classList.add('ready');
    } else {
      kick();
      sheen();
    }
  }
  C.setEdition = (ed) => {
    C.ed = ed;
    void setEdition(ed);
  };

  /* ── Choreography: scroll progress → targets ────────────────────────── */
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const io = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // in-out
  const span = (p: number, a: number, b: number) => io(clamp((p - a) / (b - a)));
  const drop = (p: number, a: number, b: number) => {
    const t = clamp((p - a) / (b - a));
    return t * t * (3 - 2 * t) * 0.35 + t * t * 0.65;
  }; // leaves gently, lands with speed
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const Z = { back: 0, core: T + FILM, face: 2 * (T + FILM) };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => view.clientWidth < 620;
  const PI = Math.PI;

  type Targets = {
    oc: number;
    oh: number;
    of: number;
    rx: number;
    ry: number;
    rz: number;
    lift: number;
    zoom: number;
    a: number;
    edge: number;
    sx: number;
    ey: number;
    rd: number;
  };
  /* moment state, shared by the choreography and the render loop */
  const fx = {
    sheen: -1, pulse: -1, glow: 0, lock: -1, cpulse: -1, power: 0, dead: 0, waitRipple: false, shake: -1,
    ring: 'idle' as 'idle' | 'ok' | 'no', rt: 0, retap: -1, retapW: 0, retapFired: false,
  };
  /* step 05: where the card touches the reader, and where it waits beside it */
  const TOUCH = RD.x - CX, AWAY = -33;
  /* Steps 01–04 run over the first 80% of the scroll; 05 has the rest. */
  const Q = 0.8;
  function targets(pp: number): Targets {
    const p = clamp(pp / Q);
    const n = narrow(), OFF = n ? { core: 13, chip: 24, face: 35 } : { core: 16, chip: 30, face: 44 };
    const a = clamp((p - 0.06) / 0.36);
    /* sheets: the core lands, then the chip seats, then the face closes */
    const oc = OFF.core * (1 - drop(a, 0, 0.42)), oh = OFF.chip * (1 - drop(a, 0.24, 0.66)), of = OFF.face * (1 - drop(a, 0.52, 1));
    /* the card: lying open → its edge turned to you → its face → its back */
    const toEdge = span(p, 0.4, 0.51), toFront = span(p, 0.57, 0.7), toBack = span(p, 0.74, 0.94);
    /* E lying open, G tipped toward you so the long edge faces you, F upright */
    const E = { x: n ? -1.05 : -1.0, y: 0, z: n ? 0.38 : 0.5 }, G = { x: -1.32, y: -0.2, z: 0 }, F = { x: -0.2, y: -0.3, z: 0.04 };
    let rx = lerp(lerp(E.x, G.x, toEdge), F.x, toFront);
    let ry = lerp(lerp(E.y, G.y, toEdge), F.y, toFront);
    let rz = lerp(lerp(E.z, G.z, toEdge), F.z, toFront);
    ry += toBack * PI;
    rz -= toBack * 0.08;
    /* the turn to the back travels in an arc: toward you, and over */
    const arc = Math.sin(toBack * PI);
    rx += arc * 0.16;
    const edge = toEdge * (1 - toFront);
    let zoom = lerp(n ? 1 : 0.82, 1, io(a)) + (n ? 0.24 : 0.26) * edge;
    /* 05 · it comes round to its face again and a reader slides in; the card
       taps it chip-first over the ring, then pulls back so you see it answer */
    const turn = span(pp, 0.8, 0.86), reach = span(pp, 0.86, 0.92), back = span(pp, 0.935, 0.985);
    ry += turn * PI + reach * 0.22 - back * 0.3;
    rx = lerp(rx, -0.12, turn);
    rx = lerp(rx, 0, reach);
    rx = lerp(rx, -0.1, back);
    rz = lerp(rz, 0, turn);
    /* a second tap (the switch flipped at the reader) swings the card from
       wherever it is to the touch point and back. The reference added a fixed
       offset, right only once the card has fully pulled back (p ≥ .985). */
    const sx = lerp(lerp(lerp(lerp(0, AWAY, turn), TOUCH, reach), AWAY, back), TOUCH, fx.retapW);
    zoom = lerp(zoom, n ? 0.8 : 0.88, turn);
    zoom = lerp(zoom, n ? 0.9 : 0.97, reach);
    zoom = lerp(zoom, n ? 0.8 : 0.88, back);
    const lift = arc * 14 + Math.sin(reach * PI) * 9 + back * 7 + Math.sin(clamp(fx.retap) * PI) * 6;
    /* small screens show the headline over the stage at first: the open
       stack sits lower until it fades, then rises to the middle */
    const intro = n ? 1 - span(pp, 0.015, 0.06) : 0;
    return { oc, oh, of, rx, ry, rz, lift, zoom, a, edge, sx, ey: 10 * edge - 15 * intro, rd: lerp(200, RD.x, turn) };
  }

  /* ── Springs ─────────────────────────────────────────────────────────── */
  /* stiffness k, damping ratio z (< 1 overshoots a little) */
  const SP: Record<string, [number, number]> = {
    rd: [55, 0.86],
    sx: [60, 0.9],
    ey: [60, 0.9],
    oc: [170, 0.62],
    oh: [150, 0.6],
    of: [140, 0.62],
    rx: [70, 0.82],
    ry: [62, 0.78],
    rz: [70, 0.82],
    lift: [70, 0.8],
    zoom: [60, 0.9],
    px: [30, 1],
    py: [30, 1],
    intro: [26, 0.72],
    dip: [260, 0.32],
  };
  const S: Record<string, number> = {}, V: Record<string, number> = {};
  let tg = targets(C.p);
  for (const k in SP) {
    S[k] = (tg as Record<string, number>)[k] ?? 0;
    V[k] = 0;
  }
  /* Before it is first seen, the pieces wait further apart and turned. */
  S.intro = 0;
  let introOn = false, tx = 0, ty = 0;
  let armed = false;
  function step(dt: number) {
    tg = targets(C.p);
    const T_: Record<string, number> = { ...tg, px: tx, py: ty, intro: introOn ? 1 : 0, dip: 0 };
    for (const k in SP) {
      if (reduce) {
        S[k] = T_[k];
        V[k] = 0;
        continue;
      }
      const [kk, z] = SP[k], c = 2 * Math.sqrt(kk) * z;
      V[k] += (kk * (T_[k] - S[k]) - c * V[k]) * dt;
      S[k] += V[k] * dt;
    }
    /* A sheet can't pass through the one under it: it lands and bounces. */
    for (const k of ['oc', 'oh', 'of'])
      if (S[k] < 0) {
        if (k === 'of' && (V[k] < -12 || armed)) {
          armed = false;
          land(Math.max(20, -V[k]));
        }
        S[k] = 0;
        V[k] = -V[k] * 0.22;
      }
    if (armed && S.of < 0.25) {
      armed = false;
      land(20);
    }
  }
  function kick() {
    V.ry += reduce ? 0 : 2.6;
  }

  /* ── Moments: landing, seating, the turn ─────────────────────────────── */
  const WARM = new THREE.Color(1, 0.62, 0.26), COOL = new THREE.Color(0.5, 0.62, 0.95), cpCol = new THREE.Color().copy(WARM);
  let chipOn = C.chipOn ?? true;
  /* The switch. On: the rings light one by one from the chip outward, then a
     warm ripple runs out and they breathe. Off: one cool ripple, the rings go
     dark from the outside in, back into the chip. The card flinches either way. */
  C.setChip = (on) => {
    chipOn = on;
    if (reduce) return;
    V.ry += on ? 0.9 : -0.9;
    V.dip -= 0.35;
    if (on) fx.waitRipple = true;
    else {
      fx.cpulse = 0;
      cpCol.copy(COOL);
      fx.waitRipple = false;
    }
    if (C.p >= 0.92) {
      // at the reader: tap the door again. From .92, where the first tap is:
      // the reference's .97 sat a hair above step 05's own landing point
      // (.9698 after the jump), so the button never got a second tap.
      fx.retap = 0;
      fx.retapFired = false;
    }
  };
  let lastLand = 0;
  function sheen() {
    if (!reduce) fx.sheen = 0;
  }
  function land(speed: number) {
    const now = performance.now();
    if (now - lastLand < 900) return;
    lastLand = now;
    if (reduce) return;
    V.dip -= Math.min(1.4, speed / 40);
    fx.pulse = 0;
    sheen();
  }
  let prevP = C.p;
  function events() {
    const p = C.p, x = (v: number) => v * Q; // thresholds for 01–04 are in their own 0–1
    if (prevP < x(0.27) && p >= x(0.27) && !reduce) fx.lock = 0; // the lock closes in
    if (prevP < x(0.3) && p >= x(0.3)) fx.glow = 1; // the chip seats
    if (prevP < x(0.42) && p >= x(0.42)) armed = true; // the face is about to close
    if (prevP < x(0.93) && p >= x(0.93)) sheen(); // the back comes round
    if (prevP < 0.92 && p >= 0.92) tap(); // 05: the card meets the reader
    if (prevP >= 0.88 && p < 0.88) {
      fx.ring = 'idle';
      fx.rt = 0;
    }
    prevP = p;
  }
  /* The tap. A live chip: the light goes green, a warm ripple runs out from
     the chip and the card settles against the reader. A switched-off chip:
     the light goes red and the card shakes its head. */
  function tap() {
    if (!alive) return;
    const ok = chipOn;
    fx.ring = ok ? 'ok' : 'no';
    fx.rt = reduce ? 9 : 0;
    if (reduce) return;
    if (ok) {
      V.dip -= 0.5;
      fx.pulse = 0;
      sheen();
    } else fx.shake = 0;
  }

  /* ── Labels: drawn in the page, pinned to points on the card ─────────── */
  type Label = HTMLElement & { _o?: number; _w?: number; _f?: boolean };
  const LBL: Record<string, Label> = {};
  labelsEl.querySelectorAll<Label>('.cl').forEach((el) => {
    LBL[el.dataset.k!] = el;
  });
  const v3 = new THREE.Vector3();
  function place(el: Label | undefined, x: number, y: number, z: number, op: number, obj: THREE.Object3D = stack) {
    if (!el) return;
    if (op < 0.01) {
      if (el._o !== 0) {
        el.style.opacity = '0';
        el._o = 0;
      }
      return;
    }
    v3.set(x, y, z).applyMatrix4(obj.matrixWorld).project(cam);
    const sx = (v3.x * 0.5 + 0.5) * vw, sy = (-v3.y * 0.5 + 0.5) * vh;
    /* a callout that would run past the canvas turns back toward the card */
    const w = el._w || (el._w = el.offsetWidth), flip = el.dataset.k !== 'edge' && sx + w > vw + 8;
    if (flip !== el._f) {
      el.classList.toggle('l', flip);
      el._f = flip;
    }
    el.style.transform = `translate3d(${(flip ? sx - w : sx).toFixed(1)}px,${sy.toFixed(1)}px,0)`;
    el.style.opacity = op.toFixed(3);
    el._o = op;
  }

  /* ── Frame and camera ───────────────────────────────────────────────── */
  let vw = 1, vh = 1, baseD = 300;
  function frame() {
    vw = view.clientWidth;
    vh = view.clientHeight;
    if (!vw || !vh) return;
    r.setSize(vw, vh, false);
    cam.aspect = vw / vh;
    const n = narrow(), FW = n ? 108 : 118, FH = n ? 96 : 100, tan = Math.tan((cam.fov * PI) / 360);
    baseD = Math.max(FH / 2 / tan, FW / 2 / (tan * cam.aspect));
    cam.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => {
    frame();
    Object.values(LBL).forEach((el) => {
      el._w = 0;
    });
  });
  ro.observe(view);
  frame();
  document.fonts?.ready.then(() =>
    Object.values(LBL).forEach((el) => {
      el._w = 0;
    }),
  );

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce) return;
    const b = view.getBoundingClientRect();
    tx = clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1.2, 1.2);
    ty = clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1.2, 1.2);
  };
  const onLeave = () => {
    tx = 0;
    ty = 0;
  };
  addEventListener('pointermove', onMove, { passive: true });
  view.addEventListener('pointerleave', onLeave);

  let seen = false;
  const io2 = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        seen = e.isIntersecting;
        if (e.intersectionRatio > 0.25 && !introOn) introOn = true;
      }),
    { threshold: [0, 0.25] },
  );
  io2.observe(view);

  let last = performance.now();
  function render(now: number) {
    const dt = Math.min(1 / 20, (now - last) / 1000);
    last = now;
    /* fixed small steps keep the springs stable at any frame rate */
    const n = Math.max(1, Math.ceil(dt / (1 / 240)));
    for (let i = 0; i < n; i++) step(dt / n);
    events();
    const t = now / 1000, open = 1 - tg.a, wait = 1 - S.intro;

    /* the sheets, plus a slow breathing while the stack is open */
    const breathe = reduce ? 0 : open;
    const spread = 1 + wait * 0.7;
    const bob = (i: number) => breathe * Math.sin(t * 1.1 + i * 1.3) * 0.7;
    back.position.z = Z.back + bob(0) * 0.4;
    core.position.z = Z.core + S.oc * spread + bob(1);
    chip.position.z = Z.core + S.oh * spread + bob(2);
    chip.rotation.z = S.oh * 0.012;
    face.position.z = Z.face + S.of * spread + bob(3);
    const top = face.position.z + T;
    stack.position.set(0, 0, -top / 2);
    guideMat.opacity = clamp((S.of - 4) / 20) * 0.42 * (1 - wait);
    setGuides(core.position.z, face.position.z);

    /* the whole card */
    const dip = S.dip;
    pivot.rotation.set(S.rx + S.py * 0.07 + wait * -0.25, S.ry + S.px * 0.1 + wait * -0.5, S.rz + wait * 0.35);
    let shake = 0;
    if (fx.shake >= 0) {
      fx.shake += dt;
      shake = Math.sin(fx.shake * 38) * Math.exp(-fx.shake * 5) * 2.2;
      if (fx.shake > 1) fx.shake = -1;
    }
    pivot.position.set(S.sx + shake, (reduce ? 0 : Math.sin(t * 0.8) * 0.5) - wait * 18 + S.ey, S.lift + dip * 6);
    reader.position.x = S.rd;
    reader.visible = S.rd < 160;
    /* the reader's light ring */
    fx.rt += dt;
    if (fx.retap >= 0) {
      fx.retap += dt / 1.1;
      const k = clamp(fx.retap);
      fx.retapW = Math.sin(k * PI);
      if (k >= 0.5 && !fx.retapFired) {
        fx.retapFired = true;
        tap();
      }
      if (fx.retap >= 1) {
        fx.retap = -1;
        fx.retapW = 0;
      }
    }
    const rb = reduce ? 0.7 : 0.6 + 0.25 * Math.sin(t * 2.2); // the ring's idle breath
    if (fx.ring === 'ok') {
      const k = clamp(fx.rt / 0.55), e = 1 - Math.pow(1 - k, 3);
      setArc(e * PI * 2);
      ringMatL.color.copy(LITE.ok);
      glowMat.color.copy(LITE.ok);
      glowMat.opacity = k < 1 ? 0.25 + 0.5 * e : 0.32 + 0.08 * Math.sin(t * 2.4);
    } else if (fx.ring === 'no') {
      setArc(PI * 2);
      // blinks, holds red, fades
      const on = fx.rt < 1.5 ? (Math.floor(fx.rt / 0.16) % 2 === 0 ? 1 : 0.12) : fx.rt < 2.1 ? 1 : clamp(1 - (fx.rt - 2.1) / 0.5);
      ringMatL.color.copy(_c.copy(LITE.off).lerp(LITE.no, on));
      glowMat.color.copy(LITE.no);
      glowMat.opacity = on * 0.45;
      if (fx.rt > 2.7) {
        fx.ring = 'idle';
        fx.rt = 0;
      }
    } else {
      setArc(PI * 2);
      ringMatL.color.copy(_c.copy(LITE.off).lerp(LITE.idle, rb * 0.7));
      glowMat.color.copy(LITE.idle);
      glowMat.opacity = rb * 0.07;
    }
    const sc = 1 + dip * 0.02;
    pivot.scale.set(sc, sc, sc);
    const d = baseD / S.zoom;
    cam.position.set(0, d * 0.06, d);
    cam.lookAt(0, 0, 0);

    /* light effects */
    const uf = M.face[0].userData.u as Uniforms, ub = M.back[1].userData.u as Uniforms;
    if (fx.sheen >= 0) {
      fx.sheen += dt * 0.9;
      if (fx.sheen > 1.6) fx.sheen = -1;
    }
    uf.uSheen.value = ub.uSheen.value = fx.sheen < 0 ? -2 : fx.sheen * 1.9 - 0.3;
    if (fx.pulse >= 0) {
      fx.pulse += dt;
      if (fx.pulse > 1.8) fx.pulse = -1;
    }
    uf.uPulse.value = fx.pulse < 0 ? -99 : fx.pulse * 30 - 2;
    fx.glow = Math.max(0, fx.glow - dt * 1.2);
    coil.emissiveIntensity = fx.glow * fx.glow * 1.6;
    /* the lock: rings start wide and close onto the chip, one after another */
    if (fx.lock >= 0) {
      fx.lock += dt;
      if (fx.lock > 1.9) fx.lock = -1;
    }
    rings.forEach((m, i) => {
      const k = fx.lock < 0 ? -1 : clamp((fx.lock - i * 0.18) / 1.1);
      if (k < 0 || k >= 1 || fx.lock < i * 0.18) {
        m.material.opacity = 0;
        return;
      }
      const e = 1 - Math.pow(1 - k, 3), rr = lerp(CHIP * 3.1, CHIP * 1.04, e);
      m.scale.set(rr, rr, 1);
      m.material.opacity = Math.sin(k * PI) * 0.85 * clamp(S.of / 8); // gone once the face closes over it
    });
    /* the back, once it faces you: a live chip's rings take their colour and
       pulse warm; a switched-off chip gives one cool ripple and its rings
       fade into the wood. The chip wakes as the card turns to its back
       (p .78), on both sides. */
    const want = chipOn && C.p > 0.78 * Q ? 1 : 0, prevPow = fx.power;
    if (reduce) fx.power = want;
    else fx.power = want > fx.power ? Math.min(want, fx.power + dt / 1.1) : Math.max(want, fx.power - dt / 0.55);
    const rising = fx.power > prevPow, falling = fx.power < prevPow;
    if (fx.waitRipple && fx.power >= 1) {
      fx.waitRipple = false;
      fx.cpulse = 0;
      cpCol.copy(WARM);
    }
    if (rising && prevPow === 0 && chipOn && C.p > 0.78 * Q && !reduce) fx.waitRipple = true;
    const wantDead = !chipOn && C.p > 0.78 * Q ? 1 : 0;
    if (reduce) fx.dead = wantDead;
    else fx.dead = wantDead > fx.dead ? Math.min(1, fx.dead + dt / 0.9) : Math.max(0, fx.dead - dt / 0.55);
    if (fx.cpulse >= 0) {
      fx.cpulse += dt;
      if (fx.cpulse > 1.6) fx.cpulse = -1;
    }
    const breath = reduce ? 0.5 : 0.42 + 0.2 * Math.sin(t * 2.4);
    for (const u of [uf, ub]) {
      u.uPower.value = fx.power;
      u.uLive.value = fx.power * breath;
      u.uFront.value = rising ? 1 - fx.power * 0.4 : falling ? 0.45 : 0;
      u.uLiveCol.value.copy(chipOn ? WARM : COOL);
      u.uDead.value = fx.dead;
    }
    ub.uPulse.value = fx.cpulse < 0 ? -99 : fx.cpulse * 34 - 2;
    ub.uPulseCol.value.copy(cpCol);
    if (fx.pulse < 0) {
      uf.uPulse.value = ub.uPulse.value;
      uf.uPulseCol.value.copy(cpCol);
    } else uf.uPulseCol.value.copy(WARM);

    r.render(scene, cam);

    /* one callout: the thickness, while the edge faces you */
    place(LBL.edge, W * 0.2, -H / 2, top / 2, clamp((tg.edge - 0.75) / 0.25) * clamp(1 - Math.abs(S.rx - -1.32) * 4));
  }

  /* The first frame does everything at once: it compiles every shader
     (the reader's glass too) and sends the textures to the GPU. The loop
     only draws while the card is on screen, so left alone that frame lands
     mid-scroll, as the section arrives: a second-long stall on a phone. So
     once the first edition's textures are in, draw one frame while the
     page is idle and the card is still off screen. */
  let warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;
    /* in small steps, one per idle moment, so none of it is a long task:
       each object's shaders, then each texture, then the frame itself */
    const idle = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 60));
    const meshes: THREE.Mesh[] = [];
    const maps = new Set<THREE.Texture>();
    reader.visible = true; // the loop hides it again until step 05
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      meshes.push(m);
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
        const t = mat as THREE.MeshPhysicalMaterial;
        [t.map, t.bumpMap, t.roughnessMap, t.alphaMap].forEach((x) => x && maps.add(x));
      });
    });
    const steps: (() => void)[] = [
      ...meshes.map((m) => () => void r.compile(m, cam, scene)),
      ...[...maps].map((t) => () => r.initTexture(t)),
      () => r.render(scene, cam),
    ];
    const next = () => {
      if (!alive || seen) return;
      const s = steps.shift();
      if (!s) return;
      reader.visible = true;
      s();
      if (steps.length) idle(next);
    };
    idle(next);
  }

  let raf = 0;
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (!seen) {
      last = now;
      return;
    }
    render(now);
  }
  raf = requestAnimationFrame(loop);
  C.setEdition(C.ed);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io2.disconnect();
    removeEventListener('pointermove', onMove);
    view.removeEventListener('pointerleave', onLeave);
    delete C.setEdition;
    delete C.setChip;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((x) => x.dispose());
    });
    /* the edition not on show is not in the scene, so dispose both sets */
    [...Object.values(M), ...Object.values(CM)].flat().forEach((m) => m.dispose());
    Object.values(cache).forEach((pr) => void pr.then((t) => t.dispose()).catch(() => {}));
    env.dispose();
    pmrem.dispose();
    r.dispose();
    r.forceContextLoss();
    r.domElement.remove();
    view.classList.remove('ready');
  };
}
