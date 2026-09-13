'use client';

import { useState } from 'react';
import { CLOSED } from '@/content/shop';
import { LiveDot } from '@/components/primitives/Button';

/* One field: tell me when the shop opens. Posts to the same endpoint as the
   join form, tagged as=merch so the list can be pulled out later. Same rule
   as the join form: it never says "done" without a 2xx from a real endpoint. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

export function ShopNotify() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    if (!ENDPOINT) {
      console.error('ShopNotify: NEXT_PUBLIC_JOIN_ENDPOINT is not set, so the email was not sent.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, as: 'merch' }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <p className="shop-notify-done" id="notify" role="status">
        {CLOSED.ok}
      </p>
    );
  }

  return (
    <form className="shop-notify" id="notify" onSubmit={onSubmit}>
      <div className="join-field">
        <label htmlFor="shop-notify-email">{CLOSED.notifyLabel}</label>
        <input id="shop-notify-email" name="email" type="email" autoComplete="email" required />
      </div>
      <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
        <LiveDot />
        {status === 'sending' ? CLOSED.sending : CLOSED.notifyButton}
      </button>
      <p className="t-sm join-status" role="status" aria-live="polite">
        {status === 'error' ? CLOSED.error : ''}
      </p>
    </form>
  );
}
