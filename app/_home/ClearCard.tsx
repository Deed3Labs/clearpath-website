'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CARD, type CardEdition } from '@/content/home';
import { ScrollTrigger, motionOK, useIsoLayoutEffect } from '@/lib/anim';
import type { CardState } from './cardScene';

/* The Clear Card, put together on scroll. Ported from
 * docs/card-section/reference/card-section.html.
 *
 * This is the page side: it owns the scroll. It pins the section under the
 * header, turns scroll into progress p (0 → 1), and drives the steps, the
 * counter and the cue, and the switch (from step 04 on) that turns the chip
 * on the card off and on. The pin runs 2.8 screens: 01–04 over the first
 * 80%, then 05, where the card taps a door reader. The 3D scene (cardScene.ts) only reads window.clearCard
 * (p, ed, chipOn) and draws it; it is imported when the section comes
 * within 600px of the screen and the hero's intro has finished, so three.js
 * and the textures never hold up the hero. The pin does not wait for the
 * scene; it is made when the intro ends or at the first scroll.
 *
 * Without motion: no pin, the card rests assembled, and the steps still
 * work. Without WebGL, or if the scene never arrives: the rendered card
 * (fallback.webp) shows after nine seconds at the latest. */

const AT = CARD.steps.map((s) => s.at);
const GO = CARD.steps.map((s) => s.go);
const stepAt = (p: number) => AT.filter((a) => p >= a).length - 1;
const pad = (n: number) => String(n).padStart(2, '0');

export function ClearCard() {
  const section = useRef<HTMLElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const segs = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLSpanElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [n, setN] = useState(0);
  const [ed, setEd] = useState<CardEdition>('light');
  const [chipOn, setChipOn] = useState(true);

  const card = () => (window.clearCard ??= { p: 0, ed: 'light', chipOn: true } as CardState);

  /* Progress in, everything the page shows about it out. */
  const setP = useRef((p: number) => {
    card().p = p;
    setN(stepAt(p));
    if (fill.current) fill.current.style.transform = `scaleY(${Math.min(1, p / 0.97)})`;
    segs.current?.querySelectorAll('i').forEach((el, i) => {
      const k = Math.max(0, Math.min(1, (p - AT[i]) / ((AT[i + 1] ?? 1) - AT[i])));
      el.style.setProperty('--k', String(k));
    });
    if (cue.current) cue.current.style.opacity = p > 0.03 ? '0' : '1';
    /* stacked layouts: the headline over the stage lifts away as the sheets
       start to move */
    section.current?.style.setProperty('--io', (1 - Math.min(1, Math.max(0, (p - 0.015) / 0.045))).toFixed(3));
  });

  /* Where the card starts: assembled without motion, open with it, in the
     Light edition with the chip on. Fresh on every visit: window.clearCard
     outlives a client-side navigation, and the buttons start over. */
  useIsoLayoutEffect(() => {
    window.clearCard = { p: 0, ed: 'light', chipOn: true };
    setP.current(motionOK() ? 0 : 0.56);
  }, []);

  /* The pin. It needs nothing from three.js, but it does wrap the section in
     a spacer and measure the page, so it is made as soon as the hero's intro
     has finished, or at the visitor's first scroll, whichever comes first:
     never during the headline's rise, and always before the section is
     reached. refreshPriority 1, then a refresh, so the triggers below (made
     earlier, in their own effects) measure with its spacer in place. */
  useEffect(() => {
    const el = section.current;
    if (!el || !motionOK()) return;
    const hero = document.querySelector('.hero');
    const kinds = ['scroll', 'wheel', 'touchstart', 'keydown'] as const;
    const head = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const make = () => {
      if (st.current) return;
      hero?.removeEventListener('hero:done', make);
      kinds.forEach((k) => removeEventListener(k, make));
      st.current = ScrollTrigger.create({
        trigger: el,
        start: () => `top ${head()}px`,
        end: () => `+=${Math.round(innerHeight * 2.8)}`,
        pin: true,
        refreshPriority: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (s) => setP.current(s.progress),
      });
      ScrollTrigger.refresh();
    };
    if (!hero || hero.getAttribute('data-intro') === 'done' || scrollY > 0) make();
    else {
      hero.addEventListener('hero:done', make, { once: true });
      kinds.forEach((k) => addEventListener(k, make, { passive: true, once: true }));
    }
    return () => {
      hero?.removeEventListener('hero:done', make);
      kinds.forEach((k) => removeEventListener(k, make));
      st.current?.kill(true);
      st.current = null;
    };
  }, []);

  /* The scene, loaded once the hero's intro has finished and the section is
     near the screen; the fallback if it never arrives. Waiting for the
     intro matters on a short screen, where the card sits just under the
     fold: its first frames (shaders, textures) would otherwise compete with
     the headline rising in. */
  useEffect(() => {
    const v = view.current, l = labels.current;
    if (!v || !l) return;
    let stop: (() => void) | undefined;
    let gone = false;
    const late = setTimeout(() => {
      if (!v.classList.contains('ready')) v.classList.add('nogl');
    }, 9000);
    const near = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        near.disconnect();
        import('./cardScene')
          .then(({ mountCardScene }) => {
            if (!gone) stop = mountCardScene(v, l);
          })
          .catch(() => v.classList.add('nogl'));
      },
      { rootMargin: '600px 0px' },
    );
    const hero = document.querySelector('.hero');
    const watch = () => near.observe(v);
    if (!hero || hero.getAttribute('data-intro') === 'done') watch();
    else hero.addEventListener('hero:done', watch, { once: true });
    return () => {
      gone = true;
      clearTimeout(late);
      hero?.removeEventListener('hero:done', watch);
      near.disconnect();
      stop?.();
    };
  }, []);

  function pickEdition(id: CardEdition) {
    setEd(id);
    const c = card();
    c.ed = id;
    c.setEdition?.(id);
  }

  function toggleChip() {
    const on = !chipOn;
    setChipOn(on);
    const c = card();
    c.chipOn = on;
    c.setChip?.(on);
  }

  function goTo(i: number) {
    const s = st.current;
    if (s) scrollTo({ top: s.start + GO[i] * (s.end - s.start), behavior: 'smooth' });
    else setP.current(GO[i]);
  }

  return (
    <section ref={section} className="cardsec" id="card" aria-labelledby="card-h">
      <div className="wrap">
        <div className="card-top label">
          <span>{CARD.label}</span>
          <span className="card-count" aria-hidden="true">
            <b>{pad(n + 1)}</b>
            <i />
            {pad(CARD.steps.length)}
          </span>
        </div>
        <div className="card-body">
          <div ref={view} className="card-view">
            <div ref={labels} className="card-labels" aria-hidden="true">
              <span className="cl" data-k="edge">
                <i />
                <span>
                  <b>{CARD.edge.k}</b>
                  <em>{CARD.edge.v}</em>
                </span>
              </span>
            </div>
            <span ref={cue} className="card-cue label" aria-hidden="true">
              {CARD.cue}
              <i />
            </span>
            {/* Shown only without WebGL, or if the scene never arrives. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="card-fallback" src="/card/fallback.webp" alt={CARD.fallback} loading="lazy" />
          </div>
          <div className="card-side">
            <div className="card-intro">
              <h2 className="h3" id="card-h">
                {CARD.title}
              </h2>
              <p>{CARD.line}</p>
            </div>
            <div className="steps">
              <span ref={fill} className="steps-fill" aria-hidden="true" />
              <span ref={segs} className="steps-seg" aria-hidden="true">
                {CARD.steps.map((s) => (
                  <i key={s.t} />
                ))}
              </span>
              {CARD.steps.map((s, i) => (
                <button
                  type="button"
                  className={i === n ? 'step on' : 'step'}
                  aria-current={i === n ? 'step' : 'false'}
                  key={s.t}
                  onClick={() => goTo(i)}
                >
                  <span className="n">{pad(i + 1)}</span>
                  <span className="t">{s.t}</span>
                  <span className="d">
                    <span>{s.d}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="card-controls">
              {/* The switch, from step 04 on. Its row keeps its height while
                  hidden, so nothing moves when it appears. */}
              <div className={n >= 3 ? 'chipsw-row show' : 'chipsw-row'} aria-hidden={n < 3}>
                <button type="button" className="chipsw" role="switch" aria-checked={chipOn} tabIndex={n >= 3 ? 0 : -1} onClick={toggleChip}>
                  <span className="track">
                    <i />
                  </span>
                  <span className="on-t">{CARD.chip.on}</span>
                  <span className="off-t">{CARD.chip.off}</span>
                </button>
                <span className="label">{CARD.chip.hint}</span>
              </div>
              <div className="editions" role="group" aria-label={CARD.editionsLabel}>
                <span className="label">{CARD.editionsLabel}</span>
                {CARD.editions.map((e) => (
                  <button type="button" className="ed" aria-pressed={ed === e.id} aria-label={e.label} key={e.id} onClick={() => pickEdition(e.id)}>
                    <i style={{ '--f': e.f, '--c': e.c } as CSSProperties} />
                    <span className="ed-t">{e.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
