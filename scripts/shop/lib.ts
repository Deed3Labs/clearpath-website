/* Shared by the owner's shop scripts (scripts/shop/*). Run by the owner,
 * from the repo, with the Stripe secret key; never deployed, never called
 * by the site.
 *
 * Stripe is the record of a reservation until the Clear API holds them:
 * the checkout put one metadata key per pre-order line on the PaymentIntent
 * (r1 = "slug/variant/qty/price/deposit/ships", see lib/shop/order.ts) and a
 * status beside it (s1). These scripts move that status:
 *
 *   reserved                      paid at checkout (the webhook stamps reserved_at)
 *   building:<date>               start-build emailed the customer that we
 *                                 start on <date>; until then a cancellation
 *                                 is refunded in full, from then it keeps
 *                                 the deposit
 *   shipped:<date>:<pi>           charge-balance took the rest
 *   awaiting-payment:<date>:<in>  the card needed the customer, so Stripe
 *                                 emailed them an invoice for the rest
 *   refunded:<date>:<re>          refund-deposit (or the declined-shop cron)
 *
 * The status stays one key per line so a 20-line order fits Stripe's 50
 * metadata keys. */

import { createInterface } from 'node:readline/promises';
import Stripe from 'stripe';
import { PRODUCTS, SUPPORT_EMAIL } from '@/content/shop';
import { usdExact } from '@/lib/shop/money';
import { readReservation, type ReservedLine } from '@/lib/shop/order';

export { usdExact };

/* .env.local, as `next dev` would read it, so the owner keeps one file. */
export function loadEnv() {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // No file: the environment alone has to carry the keys.
  }
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) fail('STRIPE_SECRET_KEY is not set (in .env.local or the environment).');
  /* STRIPE_API_BASE points the scripts at a local stand-in (stripe-mock, or
     the fake the tests use) instead of Stripe. Never set it for real work. */
  const base = process.env.STRIPE_API_BASE;
  if (base) {
    const u = new URL(base);
    return new Stripe(key, { host: u.hostname, port: Number(u.port), protocol: u.protocol.replace(':', '') as 'http' | 'https' });
  }
  return new Stripe(key);
}

export const isLive = () => (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_live_');
export const modeLabel = () => (isLive() ? 'LIVE' : 'test');

export function fail(msg: string): never {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

/* ── Arguments ─────────────────────────────────────────────────────────── */

export function args(argv = process.argv.slice(2)) {
  const flags = new Map<string, string | true>();
  const pos: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) flags.set(k, v);
      else if (argv[i + 1] && !argv[i + 1].startsWith('--') && VALUED.has(k)) flags.set(k, argv[++i]);
      else flags.set(k, true);
    } else pos.push(a);
  }
  return { pos, flags };
}
const VALUED = new Set(['shop', 'shipping', 'starts']);

/* ── Lines and statuses ────────────────────────────────────────────────── */

export type Status = 'reserved' | 'building' | 'shipped' | 'awaiting-payment' | 'refunded';
export const statusOf = (raw: string): Status => (raw.split(':')[0] as Status) || 'reserved';
export const stamp = (status: Status, ...parts: string[]) => [status, today(), ...parts].join(':');
/* The date a status carries ("building:2026-11-02" → "2026-11-02"). */
export const dateOf = (raw: string) => raw.split(':')[1] ?? '';
export const today = () => new Date().toISOString().slice(0, 10);

export function nameOf(l: Pick<ReservedLine, 'slug' | 'variant'>): string {
  const p = PRODUCTS.find((x) => x.slug === l.slug);
  if (!p) return `${l.slug} (${l.variant})`;
  const v = p.variants.find((x) => x.id === l.variant);
  return p.variants.length > 1 ? `${p.name}, ${v?.label ?? l.variant}` : p.name;
}

/* "13.60" → 1360, or null when it is missing or not dollars and cents.
   charge-balance requires it, even as 0, so shipping is never left off by
   accident. */
export function shippingCents(flag: string | true | undefined): number | null {
  if (typeof flag !== 'string' || !/^\d+(\.\d{1,2})?$/.test(flag)) return null;
  return Math.round(Number(flag) * 100);
}

export const balanceOf = (l: ReservedLine) => (l.unitCents - l.depositCents) * l.qty;
export const depositOf = (l: ReservedLine) => l.depositCents * l.qty;

/* "2 × Clear Point, Table" */
export const lineLabel = (l: ReservedLine) => `${l.qty > 1 ? `${l.qty} × ` : ''}${nameOf(l)}`;

/* ── Reservations ──────────────────────────────────────────────────────── */

export type Reservation = { pi: Stripe.PaymentIntent; lines: ReservedLine[] };

export async function getReservation(s: Stripe, id: string): Promise<Reservation> {
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) fail(`"${id}" is not a reservation id. Use the pi_… id that \`reservations\` lists.`);
  const pi = await s.paymentIntents.retrieve(id, { expand: ['customer'] });
  if (pi.metadata.kind !== 'reservation') fail(`${id} is not a reservation.`);
  if (!pi.metadata.reserved_at) console.warn(`  Note: ${id} has no reserved_at stamp; the webhook may not have run for it.`);
  return { pi, lines: readReservation(pi.metadata) };
}

export function pickLines(r: Reservation, wanted: string[]): ReservedLine[] {
  if (!wanted.length) return r.lines;
  return wanted.map((w) => {
    const n = Number(w);
    const l = r.lines.find((x) => x.n === n);
    if (!l) fail(`Line ${w} is not on ${r.pi.id}. Its lines are ${r.lines.map((x) => x.n).join(', ')}.`);
    return l;
  });
}

export function customerEmail(pi: Stripe.PaymentIntent): string | null {
  const c = pi.customer;
  if (c && typeof c === 'object' && !('deleted' in c && c.deleted)) return (c as Stripe.Customer).email ?? pi.receipt_email ?? null;
  return pi.receipt_email ?? null;
}

export const shopName = (pi: Stripe.PaymentIntent) => pi.metadata.shop ?? pi.metadata.shop_id ?? 'the shop';

/* ── Asking before money moves ─────────────────────────────────────────── */

export async function confirm(question: string, yes: boolean): Promise<void> {
  console.log(`\n  [${modeLabel()} mode] ${question}`);
  if (yes) return;
  if (!process.stdin.isTTY) fail('Refusing without a terminal to confirm in. Pass --yes to confirm.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('  Type "yes" to go ahead: ')).trim().toLowerCase();
  rl.close();
  if (answer !== 'yes') fail('Stopped. Nothing was changed.');
}

/* ── Email, through Resend (the monorepo's API sends through it too) ───── */

export type Email = { to: string; subject: string; text: string };

/* Sends when RESEND_API_KEY is set; otherwise returns false so the caller
   can print the email for the owner to send by hand. */
export async function sendEmail(e: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || `Clear <${SUPPORT_EMAIL}>`,
      to: [e.to],
      reply_to: SUPPORT_EMAIL,
      subject: e.subject,
      text: e.text,
    }),
  });
  if (!res.ok) fail(`Resend refused the email (${res.status}): ${await res.text()}`);
  return true;
}

export function printEmail(e: Email) {
  console.log(`\n  ── Email ──────────────────────────────\n  To: ${e.to}\n  Subject: ${e.subject}\n\n${e.text.replace(/^/gm, '  ')}\n  ───────────────────────────────────────\n`);
}
