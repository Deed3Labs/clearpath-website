'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { MODES, FORM, SUBMIT, type ModeKey, type Field } from '@/content/join';
import { gsap, motionOK, useHeroIntro } from '@/lib/anim';
import { Check } from '@/components/system';
import { LiveDot } from '@/components/primitives/Button';
import { FieldSelect } from './FieldSelect';
import { FieldRange } from './FieldRange';
import { FieldRangeDual } from './FieldRangeDual';

/* The join form: four answers, one set of fields, two notes.
 *
 * Built to submit for real. It posts to NEXT_PUBLIC_JOIN_ENDPOINT, and the
 * confirmation appears ONLY after a 2xx from that endpoint. No endpoint, or a
 * failed request, and it says so and says nothing was stored. The live
 * site's old form wrote the email to localStorage and showed a success
 * message — a form that silently does nothing — and there is no path through
 * this one that does that.
 *
 * The four answers are the bento's header row, a tab list (arrow keys move
 * between them, a cobalt bar slides to the chosen one). `?as=` picks the
 * starting answer; the page reads it on the server so the right fields are in
 * the HTML. Name and email lead; narrow fields pair up, and a narrow field
 * left alone on its row takes the row. The side panel says what happens next,
 * the thing that might make you walk away, and how many of the required
 * answers are in; after a successful send it repeats back what was sent.
 *
 * Rendered inside the page hero, so the answers join the hero's intro. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

type Status = 'idle' | 'sending' | 'error';
type Sent = { rows: [string, string][]; next: string };

type Item = { kind: 'name' } | { kind: 'email' } | Field;

const isRange = (f: Item) => f.kind === 'range' || f.kind === 'range2';
const isWide = (f: Item) => isRange(f) || (f.kind === 'text' && !!f.wide);
/* The fields whose answers count towards "Your answers", and that must be in
   before anything is sent: name, email, and every text or select field. */
const reqName = (f: Item): string | null =>
  f.kind === 'name' ? 'name' : f.kind === 'email' ? 'email' : f.kind === 'text' || f.kind === 'select' ? f.name : null;

/* Name and email lead. A narrow field pairs with the next narrow one; a
   narrow field left alone on its row (a run of odd length between wide ones)
   takes the row. */
function layout(fields: Field[]) {
  const list: Item[] = [{ kind: 'name' }, { kind: 'email' }, ...fields];
  const out: { f: Item; wide: boolean }[] = [];
  let run: Item[] = [];
  const flush = () => {
    run.forEach((f) => out.push({ f, wide: run.length === 1 }));
    run = [];
  };
  for (const f of list) {
    if (isWide(f)) {
      flush();
      out.push({ f, wide: true });
    } else {
      run.push(f);
      if (run.length === 2) flush();
    }
  }
  flush();
  return out;
}

const EMAIL = /^\S+@\S+\.\S+$/;

export function JoinForm({ initialMode }: { initialMode: ModeKey }) {
  /* The chosen answer (the tabs follow it at once) and the one whose fields
     are drawn (follows a beat later, behind a short fade). */
  const [mode, setModeState] = useState<ModeKey>(initialMode);
  const [shown, setShown] = useState<ModeKey>(initialMode);
  const [out, setOut] = useState(false);
  const [gen, setGen] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [bad, setBad] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sent, setSent] = useState<Sent | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const m = MODES.find((x) => x.key === shown) ?? MODES[0];
  const idx = MODES.findIndex((x) => x.key === mode);
  const items = layout(m.fields);
  const required = items.map((i) => reqName(i.f)).filter((n): n is string => !!n);
  const answered = required.filter((n) => (values[n] ?? '').trim()).length;
  const all = answered === required.length;

  /* The answers join the hero's intro once the form has arrived. */
  useHeroIntro(formRef, (tl, hero) => {
    tl.from(hero.querySelectorAll('.mode'), { opacity: 0, y: 8, duration: 0.45, stagger: 0.07 }, '-=.5');
  });

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  function setMode(k: ModeKey, focus = false) {
    if (focus) tabs.current[k]?.focus();
    if (k === mode && !sent) return;
    setModeState(k);
    setSent(null);
    setStatus('idle');
    setMsg('');
    setBad([]);
    const swap = () => {
      setShown(k);
      setValues({});
      setGen((g) => g + 1);
      setOut(false);
    };
    if (!motionOK()) return swap();
    setOut(true);
    later(swap, 200);
  }

  /* A link to /join?as=… while already on /join arrives as a new prop. */
  useEffect(() => {
    setMode(initialMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode]);

  function onTabKey(e: KeyboardEvent) {
    const n = MODES.length;
    const go: Record<string, number> = { ArrowRight: idx + 1, ArrowLeft: idx - 1 + n, Home: 0, End: n - 1 };
    if (!(e.key in go)) return;
    e.preventDefault();
    setMode(MODES[go[e.key] % n].key, true);
  }

  const record = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    setMsg('');
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    /* Every required answer in, and the email shaped like one. */
    const missing = required.filter((n) => {
      const v = (values[n] ?? '').trim();
      return !v || (n === 'email' && !EMAIL.test(v));
    });
    if (missing.length) {
      setMsg(missing.length === 1 ? FORM.missingOne : `${missing.length} ${FORM.missingMany}`);
      setBad(missing);
      const first = form.querySelector<HTMLElement>(`[data-req="${missing[0]}"] input:not([type=hidden]), [data-req="${missing[0]}"] .fs-btn`);
      first?.focus();
      later(() => setBad([]), 2400);
      return;
    }
    setMsg('');
    const data = Object.fromEntries(new FormData(form).entries());

    if (!ENDPOINT) {
      /* Loud rather than silent: without this the only symptom of a missing
         variable is a form that fails for every visitor and nobody knowing. */
      console.error('JoinForm: NEXT_PUBLIC_JOIN_ENDPOINT is not set, so the submission was not sent.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, as: shown }),
      });
      if (!res.ok) {
        setStatus('error');
        return;
      }
    } catch {
      setStatus('error');
      return;
    }

    /* Confirmed by the endpoint: repeat back what was sent. */
    const rows: [string, string][] = [
      [SUBMIT.youSaid, m.tab],
      [m.nameLabel, String(data.name ?? '')],
      [FORM.email, String(data.email ?? '')],
    ];
    const zip = m.fields.find((f) => f.kind === 'text' && f.name === 'zip');
    if (zip) rows.push([zip.label, String(data.zip ?? '')]);
    setStatus('idle');
    setSent({ rows, next: m.next });
  }

  /* The confirmation arrives: it rises in, and below 1000px, where it sits
     under the form rather than beside it, it is brought into view. */
  useEffect(() => {
    if (!sent || !doneRef.current) return;
    const el = doneRef.current;
    if (motionOK()) gsap.from(el.children, { opacity: 0, y: 8, duration: 0.45, stagger: 0.07, ease: 'power3.out' });
    if (window.matchMedia('(max-width: 1000px)').matches) {
      el.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'center' });
    }
  }, [sent]);

  function again() {
    formRef.current?.reset();
    setSent(null);
    setValues({});
    setGen((g) => g + 1);
  }

  const field = ({ f, wide }: { f: Item; wide: boolean }) => {
    const req = reqName(f);
    const isBad = !!req && bad.includes(req);
    const w = wide ? ' wide' : '';
    if (f.kind === 'name' || f.kind === 'email') {
      const name = f.kind;
      return (
        <div className={`f${w}`} key={name} data-req={name} data-bad={isBad ? '' : undefined}>
          <label htmlFor={`j-${name}`}>{name === 'name' ? m.nameLabel : FORM.email}</label>
          <input
            id={`j-${name}`}
            name={name}
            type={name === 'email' ? 'email' : 'text'}
            autoComplete={name}
            required
            onInput={(e) => record(name, e.currentTarget.value)}
          />
        </div>
      );
    }
    if (f.kind === 'text') {
      return (
        <div className={`f${w}`} key={f.name} data-req={f.name} data-bad={isBad ? '' : undefined}>
          <label htmlFor={`j-${f.name}`}>{f.label}</label>
          <input
            id={`j-${f.name}`}
            name={f.name}
            type="text"
            autoComplete={f.autoComplete ?? 'off'}
            inputMode={f.numeric ? 'numeric' : undefined}
            maxLength={f.numeric ? 5 : undefined}
            required
            onInput={(e) => record(f.name, e.currentTarget.value)}
          />
        </div>
      );
    }
    if (f.kind === 'select') {
      return (
        <div className="fs-slot" key={f.name} data-req={f.name} style={{ display: 'contents' }}>
          <FieldSelect
            name={f.name}
            label={f.label}
            placeholder={f.placeholder}
            options={f.options}
            wide={wide}
            required
            bad={isBad}
            onChange={(v) => record(f.name, v)}
          />
        </div>
      );
    }
    if (f.kind === 'range2') {
      return (
        <FieldRangeDual
          key={f.nameMin}
          nameMin={f.nameMin}
          nameMax={f.nameMax}
          label={f.label}
          lowWord={FORM.rangeLow}
          highWord={FORM.rangeHigh}
          min={f.min}
          max={f.max}
          step={f.step}
          startLow={f.startLow}
          startHigh={f.startHigh}
          format={f.format}
          topLabel={f.topLabel}
        />
      );
    }
    return (
      <FieldRange
        key={f.name}
        name={f.name}
        label={f.label}
        min={f.min}
        max={f.max}
        step={f.step}
        start={f.start}
        format={f.format}
        topLabel={f.topLabel}
      />
    );
  };

  const swap = out ? 'swap out' : 'swap';
  return (
    <form
      ref={formRef}
      className={sent ? 'bx joinf sent' : 'bx joinf'}
      data-stage="bento"
      noValidate
      method="post"
      action={ENDPOINT || undefined}
      onSubmit={onSubmit}
    >
      <div className="modes" role="tablist" aria-label={FORM.question} onKeyDown={onTabKey}>
        {MODES.map((x) => (
          <button
            key={x.key}
            ref={(el) => {
              tabs.current[x.key] = el;
            }}
            type="button"
            className="mode"
            role="tab"
            id={`join-tab-${x.key}`}
            aria-selected={x.key === mode}
            aria-controls="join-panel"
            tabIndex={x.key === mode ? 0 : -1}
            onClick={() => setMode(x.key)}
          >
            <b>{x.n}</b>
            <span>{x.tab}</span>
            <small>{x.sub}</small>
          </button>
        ))}
        <span className="bar" aria-hidden="true" style={{ ['--i' as string]: idx }} />
      </div>

      <div className={`fields ${swap}`} id="join-panel" role="tabpanel" aria-labelledby={`join-tab-${mode}`}>
        <Fragment key={`${shown}-${gen}`}>
        {items.map(field)}
        <div className="f wide">
          <label htmlFor="j-note">{m.noteLabel}</label>
          <textarea id="j-note" name="note" rows={3} />
        </div>
        </Fragment>
        <div className="sub">
          <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
            <LiveDot />
            {status === 'sending' ? SUBMIT.sending : m.button}
          </button>
          <span className="st" role="status" aria-live="polite">
            {status === 'error' ? SUBMIT.error : msg}
          </span>
        </div>
      </div>

      <aside className="aside2">
        <div className={`n1 ${swap}`}>
          <span className="label">{FORM.next}</span>
          <p className="nx">{m.next}</p>
        </div>
        <div className={`n2 ${swap}`}>
          <span className="label">{m.caveatLabel}</span>
          <p className="cv">{m.caveat}</p>
        </div>
        <div className={`n3 ${swap}`}>
          <span className="label">{FORM.answers}</span>
          <div className={all ? 'prog all' : 'prog'} aria-hidden="true">
            {required.map((n, i) => (
              <i key={n} className={i < answered ? 'on' : undefined} />
            ))}
          </div>
          <span className="pc">{all ? FORM.ready : `${answered} ${FORM.of} ${required.length} ${FORM.answered}`}</span>
        </div>
        {sent && (
          <div className="done" ref={doneRef} role="status">
            <span className="ok">
              <Check />
              {SUBMIT.ok}
            </span>
            <div className="rc">
              {sent.rows.map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <p className="cv">{sent.next}</p>
            <button type="button" onClick={again}>
              {SUBMIT.again}
            </button>
          </div>
        )}
        <div className="where">
          <span className="pin">
            <i aria-hidden="true" />
            {FORM.where}
          </span>
        </div>
      </aside>
    </form>
  );
}
