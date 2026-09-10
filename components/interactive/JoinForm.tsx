'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MODES, OPENING, SUBMIT, type ModeKey } from '@/content/join';
import { FieldSelect } from './FieldSelect';
import { FieldRange } from './FieldRange';
import { FieldRangeDual } from './FieldRangeDual';

/* §6.8 — four modes, deep-linkable, and built to submit for real.
 *
 * TODO(endpoint): set NEXT_PUBLIC_JOIN_ENDPOINT to the form endpoint. That is
 * the only thing left; nothing else here is a placeholder.
 *
 * What this will never do is the thing §6.8 forbids. The live site's old form
 * accepted an email, wrote it to localStorage and showed a success message —
 * a form that silently does nothing. There is no path through this one that
 * reports success without a 2xx from a real endpoint: no endpoint, or a
 * failed request, and it says so and says nothing was stored.
 *
 * The whole band is one component because the question, the four answers, the
 * fields and the two notes all read from one piece of state. Splitting them
 * across a server boundary meant the notes could not follow a click, only a
 * deep link — so someone who switched mode mid-page got the wrong ones.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

const isMode = (v: string | null): v is ModeKey => !!v && MODES.some((m) => m.key === v);

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function JoinForm() {
  const params = useSearchParams();
  const fromUrl = params.get('as');
  const [mode, setMode] = useState<ModeKey>(isMode(fromUrl) ? fromUrl : 'member');
  const [status, setStatus] = useState<Status>('idle');

  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    if (!ENDPOINT) {
      /* Loud rather than silent: without this the only symptom of a missing
         variable is a form that fails for every visitor and nobody knowing. */
      console.error(
        'JoinForm: NEXT_PUBLIC_JOIN_ENDPOINT is not set, so the submission was not sent.',
      );
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, as: mode }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="hx-grid join">
      <div className="c-half join-lead">
        <h1 className="hx-h2">{OPENING.heading}</h1>
        <p className="hx-lede">{OPENING.lede}</p>

        {/* A ruled list, not a row of pills: four real sentences do not fit a
            pill row, and on this page choosing one IS the content. */}
        <div className="join-modes" role="group" aria-label="What are you getting in touch about?">
          {MODES.map((m, i) => (
            <button
              key={m.key}
              type="button"
              className="join-mode"
              aria-pressed={m.key === mode}
              onClick={() => {
                setMode(m.key);
                setStatus('idle');
              }}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>{m.tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="c-half">
        <form className="join-form" onSubmit={onSubmit}>
          <fieldset>
            <legend className="sr-only">{active.tab}</legend>

            {/* Name and email are on every mode, so they are rendered here
                rather than repeated four times in the content. Only the name's
                wording changes — a shop is giving us a person to call. */}
            <div className="join-field">
              <label htmlFor="join-name">{active.nameLabel}</label>
              <input id="join-name" name="name" type="text" autoComplete="name" required />
            </div>

            <div className="join-field">
              <label htmlFor="join-email">Email</label>
              <input id="join-email" name="email" type="email" autoComplete="email" required />
            </div>

            {active.fields.map((f) => {
              /* Keyed by mode as well as name so switching modes remounts the
                 controls. Without it a select or a range that appears in two
                 modes would keep the previous mode's answer. */
              const key = `${mode}-${f.kind === 'range2' ? f.nameMin : f.name}`;

              if (f.kind === 'select') {
                return (
                  <FieldSelect
                    key={key}
                    name={f.name}
                    label={f.label}
                    placeholder={f.placeholder}
                    options={[...f.options]}
                    wide={f.wide}
                  />
                );
              }

              if (f.kind === 'range2') {
                return (
                  <FieldRangeDual
                    key={key}
                    nameMin={f.nameMin}
                    nameMax={f.nameMax}
                    label={f.label}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    startLow={f.startLow}
                    startHigh={f.startHigh}
                    format={f.format}
                    topLabel={f.topLabel}
                    wide={f.wide}
                  />
                );
              }

              if (f.kind === 'range') {
                return (
                  <FieldRange
                    key={key}
                    name={f.name}
                    label={f.label}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    start={f.start}
                    format={f.format}
                    topLabel={f.topLabel}
                    wide={f.wide}
                  />
                );
              }

              return (
                <div className={`join-field${f.wide ? ' is-wide' : ''}`} key={key}>
                  <label htmlFor={`join-${f.name}`}>{f.label}</label>
                  <input
                    id={`join-${f.name}`}
                    name={f.name}
                    type="text"
                    autoComplete={f.autoComplete}
                    inputMode={f.numeric ? 'numeric' : undefined}
                  />
                </div>
              );
            })}

            <div className="join-field is-wide">
              <label htmlFor="join-note">{active.noteLabel}</label>
              <textarea id="join-note" name="note" rows={4} />
            </div>

            <div className="join-submit is-wide">
              <button
                type="submit"
                className="btn"
                data-variant="primary"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? SUBMIT.sending : active.button}
              </button>
              <p className="t-sm join-status" role="status" aria-live="polite">
                {status === 'ok' ? SUBMIT.ok : status === 'error' ? SUBMIT.error : ''}
              </p>
            </div>
          </fieldset>
        </form>

        {/* Under the button, not in a section of their own: this is what
            somebody hesitating over it wants to know. */}
        <div className="join-after">
          <div className="side">
            <p className="side-label">What happens next</p>
            <p className="t-sm side-note">{active.next}</p>
          </div>
          <div className="side">
            <p className="side-label">{active.caveatLabel}</p>
            <p className="t-sm side-note">{active.caveat}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
