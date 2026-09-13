'use client';

import { useState } from 'react';
import { LiveDot } from '@/components/primitives/Button';

/* One field: "email me when…". Posts to the join form's endpoint, tagged
   with `as` so each list can be pulled out later (merch, events). Same rule
   as the join form: it never says "done" without a 2xx from a real endpoint. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

export type NotifyCopy = {
  label: string;
  button: string;
  sending: string;
  ok: string;
  error: string;
};

export function NotifyForm({ as, copy, id = 'notify' }: { as: string; copy: NotifyCopy; id?: string }) {
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

  if (status === 'ok') {
    return (
      <p className="shop-notify-done" id={id} role="status">
        {copy.ok}
      </p>
    );
  }

  return (
    <form className="shop-notify" id={id} onSubmit={onSubmit}>
      <div className="join-field">
        <label htmlFor={`${id}-email`}>{copy.label}</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
      </div>
      <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
        <LiveDot />
        {status === 'sending' ? copy.sending : copy.button}
      </button>
      <p className="t-sm join-status" role="status" aria-live="polite">
        {status === 'error' ? copy.error : ''}
      </p>
    </form>
  );
}
