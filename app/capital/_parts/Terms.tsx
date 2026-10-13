'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Seg, Fig, More } from '@/components/system';
import { gsap, motionOK, useInView } from '@/lib/anim';
import { money, int } from '@/lib/format';
import { CONTRIBUTIONS, type ScaleKey } from '@/content/capital';

/* 02: the same terms at any size. The toggle tweens the property value and
   the shares issued, moves the pool bar, and every term row flashes "Same"
   to confirm it did not move. The first time the bento is seen it flips to
   the portfolio once on its own.

   The pool bar's slices each carry a full and a short name. Which one shows
   is decided by measuring the slice, not by a breakpoint: when the full name
   (plus its padding) is wider than the slice, the slice goes `tight`, shows
   the short name, and may grow to fit it (min-width: max-content). */

const C = CONTRIBUTIONS;

export function Terms() {
  const [scale, setScaleState] = useState<ScaleKey>('one');
  const [shown, setShown] = useState(C.scales.one.prop);
  const [same, setSame] = useState<boolean[]>(() => C.terms.map(() => false));
  const cur = useRef<ScaleKey>('one');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tween = useRef<gsap.core.Tween | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);

  const setScale = useCallback((k: ScaleKey) => {
    if (k === cur.current) return;
    const from = C.scales[cur.current].prop;
    const to = C.scales[k].prop;
    cur.current = k;
    setScaleState(k);
    tween.current?.kill();
    if (motionOK()) {
      const o = { v: from };
      tween.current = gsap.to(o, { v: to, duration: 0.9, ease: 'power3.out', onUpdate: () => setShown(Math.round(o.v)) });
    } else setShown(to);
    /* Every term row confirms it did not move. */
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSame(C.terms.map(() => false));
    C.terms.forEach((_, i) =>
      timers.current.push(setTimeout(() => setSame((s) => s.map((v, j) => (j === i ? true : v))), 160 + i * 110)),
    );
    timers.current.push(setTimeout(() => setSame(C.terms.map(() => false)), 2600));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      tween.current?.kill();
    },
    [],
  );

  /* Flips once on its own the first time it is seen. */
  useInView(
    root,
    () => {
      const t = setTimeout(() => setScale('port'), 700);
      return () => clearTimeout(t);
    },
    { start: 'top 60%' },
  );

  /* Either slice drops to its short name when the full one will not fit. */
  useEffect(() => {
    const slices = Array.from(pool.current?.children ?? []) as HTMLElement[];
    const fit = () =>
      slices.forEach((sl) => {
        sl.classList.remove('tight');
        const full = sl.querySelector<HTMLElement>('.full');
        sl.classList.toggle('tight', !!full && full.offsetWidth + 20 > sl.clientWidth);
      });
    const ro = new ResizeObserver(fit);
    slices.forEach((sl) => ro.observe(sl));
    fit();
    return () => ro.disconnect();
  }, []);

  const s = C.scales[scale];
  return (
    <div className="bx terms body-gap" ref={root}>
      <div className="c-h">
        <Seg label={C.seg.label} options={C.seg.options} value={scale} onChange={setScale} />
        <span className="ck">{C.ck}</span>
      </div>
      <div className="sum">
        <div>
          <span className="k">{C.sum.prop}</span>
          <Fig className="v">{money(shown, 0)}</Fig>
          <span className="s">{s.name}</span>
        </div>
        <div>
          <span className="k">{C.sum.shares}</span>
          <Fig className="v" live>
            {int(shown)}
          </Fig>
          <span className="s">{C.sum.sharesNote}</span>
        </div>
        <div>
          <span className="k">{C.sum.pool}</span>
          <div className="pool" aria-hidden="true" ref={pool}>
            <span className="cc" style={{ flexBasis: `${s.cc}%` }}>
              <b className="full">{C.pool.cc.full}</b>
              <b className="short">{C.pool.cc.short}</b>
            </span>
            <span className="ct">
              <b className="full">{C.pool.ct.full}</b>
              <b className="short">{C.pool.ct.short}</b>
            </span>
          </div>
          <span className="s">{C.sum.poolNote}</span>
        </div>
      </div>
      {C.terms.map((t, i) => (
        <div className={same[i] ? 'term same' : 'term'} key={t.label}>
          <span className="tl">{t.label}</span>
          <span className="tv">
            {t.value}
            <i aria-hidden="true">{C.same}</i>
          </span>
          <span className="td">{t.desc}</span>
        </div>
      ))}
      <div className="c-f">
        <span>{C.foot}</span>
        <More href={C.more.href}>{C.more.label}</More>
      </div>
    </div>
  );
}
