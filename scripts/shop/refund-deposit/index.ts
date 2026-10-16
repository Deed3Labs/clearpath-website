/* Refund a reservation's deposits in full: every open line, or the lines
 * named. Goods in the same order are not touched.
 *   npm run shop:refund-deposit -- <pi_…> [line …] [--force] [--yes]
 * A line still reserved, or building but before its start date, is
 * refundable as promised. From the start date the terms keep the deposit,
 * so --force is needed (a missed ship date, or a failed FCC authorization,
 * is a reason to). See README.md beside this file. */

import { args, confirm, dateOf, depositOf, fail, getReservation, lineLabel, loadEnv, pickLines, stamp, statusOf, stripe, today, usdExact } from '../lib';

async function main() {
  loadEnv();
  const { pos, flags } = args();
  const [id, ...wanted] = pos;
  if (!id) fail('Usage: npm run shop:refund-deposit -- <pi_…> [line …] [--force]');
  const s = stripe();
  const r = await getReservation(s, id);

  const lines = [];
  for (const l of pickLines(r, wanted)) {
    const st = statusOf(l.status);
    if (st === 'refunded' || st === 'shipped') {
      console.log(`  Skipping line ${l.n} (${lineLabel(l)}): it is ${l.status}.`);
      continue;
    }
    if (st === 'awaiting-payment') {
      fail(`Line ${l.n} has an open invoice for the rest (${l.status.split(':')[2]}). Void it in the Stripe dashboard first, then run this again.`);
    }
    if (st === 'building' && dateOf(l.status) <= today() && !flags.has('force')) {
      fail(`Line ${l.n} started building on ${dateOf(l.status)}, so the terms keep its deposit. Pass --force to refund it anyway (a missed ship date or failed FCC authorization).`);
    }
    lines.push(l);
  }
  if (!lines.length) fail('Nothing to refund.');

  const amount = lines.reduce((n, l) => n + depositOf(l), 0);
  await confirm(`Refund ${usdExact(amount)} in deposits for ${lines.map((l) => `line ${l.n} (${lineLabel(l)})`).join(', ')}?`, flags.has('yes'));

  const which = lines.map((l) => l.n).join(',');
  const refund = await s.refunds.create(
    { payment_intent: r.pi.id, amount, metadata: { reason: 'deposit refund', lines: which } },
    { idempotencyKey: `refund-${r.pi.id}-${which}` },
  );
  const marks: Record<string, string> = {};
  for (const l of lines) marks[`s${l.n}`] = stamp('refunded', refund.id);
  await s.paymentIntents.update(r.pi.id, { metadata: marks });
  console.log(`\n  Refunded ${usdExact(amount)}: ${refund.id} (${refund.status}). Stripe emails the customer a refund receipt if receipts are on (Settings › Emails).\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
