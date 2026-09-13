import Stripe from 'stripe';

/* Server-side Stripe client. Built lazily so `next build` renders the shop
   pages on a machine with no keys; the missing key is reported at request
   time, where someone can act on it. Test and live keys are the same code
   path — sk_test_ vs sk_live_ is the only switch. */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.');
  cached = new Stripe(key);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
