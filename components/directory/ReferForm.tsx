'use client';

import { useState } from 'react';
import { LiveDot } from '@/components/primitives/Button';
import { REFER } from '@/content/directory';

/* Refer a business. Three fields, posted to the join form's endpoint tagged
   as=referral. Same rule as every form on the site: no "thank you" without a
   2xx from a real endpoint. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;

export function ReferForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!ENDPOINT) {
      console.error('ReferForm: NEXT_PUBLIC_JOIN_ENDPOINT is not set, so the referral was not sent.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, as: 'referral' }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <p className="shop-notify-done" role="status">
        {REFER.ok}
      </p>
    );
  }

  return (
    <form className="join-form dir-refer" onSubmit={onSubmit}>
      <fieldset>
        <div className="join-field">
          <label htmlFor="refer-business">{REFER.business}</label>
          <input id="refer-business" name="business" type="text" autoComplete="off" required />
        </div>
        <div className="join-field">
          <label htmlFor="refer-city">{REFER.city}</label>
          <input id="refer-city" name="city" type="text" autoComplete="address-level2" required />
        </div>
        <div className="join-field is-wide">
          <label htmlFor="refer-email">{REFER.email}</label>
          <input id="refer-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="join-submit is-wide">
          <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
            <LiveDot />
            {status === 'sending' ? REFER.sending : REFER.button}
          </button>
          <p className="t-sm join-status" role="status" aria-live="polite">
            {status === 'error' ? REFER.error : ''}
          </p>
        </div>
      </fieldset>
    </form>
  );
}
