'use client';

import { useState } from 'react';
import { LiveDot } from '@/components/primitives/Button';
import { PillField } from '@/components/system/PillField';

/* One field: "email me when…". Posts to the join form's endpoint, tagged
   with `as` so each list can be pulled out later (merch, events). Same rule
   as the join form: it never says "done" without a 2xx from a real endpoint,
   and a failure says the email was not stored.

   The field is a PillField — the input and its button in one pill — and the
   confirmation takes its place once the endpoint says yes. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

export type NotifyCopy = {
  /* The field's accessible name (visually hidden). */
  label: string;
  placeholder?: string;
  button: string;
  sending: string;
  ok: string;
  error: string;
  /* A line under the field, e.g. "One email, the day the doors open." */
  note?: string;
};

export function NotifyForm({
  as,
  copy,
  id = 'notify',
  size = 'md',
  className,
}: {
  as: string;
  copy: NotifyCopy;
  id?: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    if (!ENDPOINT) {
      console.error(`NotifyForm(${as}): NEXT_PUBLIC_JOIN_ENDPOINT is not set, so the email was not sent.`);
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, as }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className={['notify', className].filter(Boolean).join(' ')} id={id} onSubmit={onSubmit} aria-live="polite">
      <PillField
        size={size}
        label={copy.label}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={copy.placeholder ?? copy.label}
        required
        disabled={status === 'sending'}
        invalid={status === 'error'}
        done={status === 'ok' ? copy.ok : undefined}
        note={status === 'error' ? copy.error : copy.note}
        button={
          <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
            <LiveDot />
            {status === 'sending' ? copy.sending : copy.button}
          </button>
        }
      />
    </form>
  );
}
