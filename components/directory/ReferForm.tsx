'use client';

import { useRef, useState } from 'react';
import { Check } from '@/components/system/icons';
import { Chip } from '@/components/primitives';
import { LiveDot } from '@/components/primitives/Button';
import { gsap, motionOK } from '@/lib/anim/gsap';
import { useIsoLayoutEffect } from '@/lib/anim/hooks';
import { REFER } from '@/content/directory';

/* Refer a business: a framed cell with three underline fields (the join
   form's), posted to the join form's endpoint tagged as=referral.

   Same rule as every form on the site: no "thank you" without a 2xx from a
   real endpoint. A failure keeps what was typed and says nothing was stored.
   On success the frame stays and says who we will reach out to. */

const ENDPOINT = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;
const EMAIL = /^\S+@\S+\.\S+$/;

type Field = 'business' | 'city' | 'email';
const FIELDS: { name: Field; label: string; placeholder: string; type: string; auto: string }[] = [
  { name: 'business', label: REFER.business, placeholder: REFER.businessPlaceholder, type: 'text', auto: 'off' },
  { name: 'city', label: REFER.city, placeholder: REFER.cityPlaceholder, type: 'text', auto: 'address-level2' },
  { name: 'email', label: REFER.email, placeholder: REFER.emailPlaceholder, type: 'email', auto: 'email' },
];

export function ReferForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [bad, setBad] = useState<Set<Field>>(new Set());
  const [sentTo, setSentTo] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  /* The thank-you rises in once it is there. */
  useIsoLayoutEffect(() => {
    const ok = formRef.current?.querySelector('.ok');
    if (status !== 'ok' || !ok || !motionOK()) return;
    const t = gsap.from(ok.children, { opacity: 0, y: 8, duration: 0.45, stagger: 0.08, clearProps: 'opacity,transform' });
    return () => {
      t.revert();
    };
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<Field, string>;
    const wrong = new Set(FIELDS.filter((f) => !data[f.name]?.trim() || (f.name === 'email' && !EMAIL.test(data.email))).map((f) => f.name));
    setBad(wrong);
    if (wrong.size) {
      form.querySelector<HTMLInputElement>(`[name="${[...wrong][0]}"]`)?.focus();
      return;
    }
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
      if (res.ok) {
        setSentTo(data.business.trim());
        setStatus('ok');
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  function again() {
    setStatus('idle');
    setBad(new Set());
    requestAnimationFrame(() => formRef.current?.querySelector('input')?.focus());
  }

  if (status === 'ok') {
    return (
      <form className="refer2" ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="c-h">
          <span className="who">{REFER.who}</span>
          <Chip tone="live">{REFER.sent}</Chip>
        </div>
        <div className="ok" role="status">
          <p>
            <Check />
            {REFER.ok(sentTo)}
          </p>
          <button type="button" onClick={again}>
            {REFER.again}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="refer2" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="c-h">
        <span className="who">{REFER.who}</span>
        <span className="ck">{REFER.ck}</span>
      </div>
      <div className="rf">
        {FIELDS.map((f) => (
          <label className={bad.has(f.name) ? 'f2 bad' : 'f2'} key={f.name}>
            <span className="lb">{f.label}</span>
            <input
              name={f.name}
              type={f.type}
              autoComplete={f.auto}
              placeholder={f.placeholder}
              required
              aria-invalid={bad.has(f.name) || undefined}
              onInput={() => {
                if (!bad.has(f.name)) return;
                setBad((b) => {
                  const n = new Set(b);
                  n.delete(f.name);
                  return n;
                });
              }}
            />
          </label>
        ))}
      </div>
      <div className="c-f">
        <span className={status === 'error' ? 'ck err' : 'ck'} role="status" aria-live="polite">
          {status === 'error' ? REFER.error : REFER.foot}
        </span>
        <button type="submit" className="btn" data-variant="primary" disabled={status === 'sending'}>
          <LiveDot />
          {status === 'sending' ? REFER.sending : REFER.button}
        </button>
      </div>
    </form>
  );
}
