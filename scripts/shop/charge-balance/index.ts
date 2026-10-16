/* Charge the rest of one reserved line, plus its shipping, to the card the
 * customer saved at checkout. Run it when that line ships.
 *   npm run shop:charge-balance -- <pi_…> <line> --shipping <dollars> [--force] [--yes]
 * If Stripe needs the customer to confirm (or the card is declined), Stripe
 * emails them an invoice for the same amount instead. See README.md. */

import type Stripe from 'stripe';
import { balanceInvoiceFooter, balanceInvoiceLine, shippingInvoiceLine } from '../emails';
import { args, balanceOf, confirm, fail, getReservation, lineLabel, loadEnv, pickLines, shippingCents, stamp, statusOf, stripe, usdExact } from '../lib';

async function main() {
  loadEnv();
  const { pos, flags } = args();
  const [id, n] = pos;
  if (!id || !n) fail('Usage: npm run shop:charge-balance -- <pi_…> <line> --shipping <dollars>');
  const ship = shippingCents(flags.get('shipping'));
  if (ship === null) fail('--shipping is required: the label cost in dollars, like --shipping 13.60 (or 0).');
  const s = stripe();
  const r = await getReservation(s, id);
  const [l] = pickLines(r, [n]);

  const st = statusOf(l.status);
  if (st === 'shipped' || st === 'refunded' || st === 'awaiting-payment') fail(`Line ${l.n} is ${l.status}. Nothing to charge.`);
  if (st === 'reserved' && !flags.has('force')) fail(`Line ${l.n} was never started (no build email went out). Run start-build first, or pass --force.`);

  const customer = typeof r.pi.customer === 'string' ? r.pi.customer : r.pi.customer?.id;
  const pm = typeof r.pi.payment_method === 'string' ? r.pi.payment_method : r.pi.payment_method?.id;
  if (!customer || !pm) fail(`${id} has no saved card on a customer. Send them an invoice from the Stripe dashboard instead.`);

  const balance = balanceOf(l);
  const amount = balance + ship;
  const label = lineLabel(l);
  /* TODO(owner): with sales tax switched on, the tax on the unit belongs on
     this charge (deposits were not taxed). Add it here once the accountant
     has said how. */
  await confirm(`Charge ${usdExact(amount)} (the rest, ${usdExact(balance)}, plus shipping ${usdExact(ship)}) for line ${l.n}, ${label}, to the saved card?`, flags.has('yes'));

  const meta = { kind: 'balance', reservation: r.pi.id, line: String(l.n), shipping_cents: String(ship) };
  try {
    const paid = await s.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        customer,
        payment_method: pm,
        off_session: true,
        confirm: true,
        description: balanceInvoiceLine(label, l.ships),
        metadata: meta,
      },
      { idempotencyKey: `balance-${r.pi.id}-${l.n}` },
    );
    if (paid.status !== 'succeeded') throw Object.assign(new Error(`status ${paid.status}`), { needsCustomer: true });
    await s.paymentIntents.update(r.pi.id, { metadata: { [`s${l.n}`]: stamp('shipped', paid.id) } });
    console.log(`\n  Charged ${usdExact(amount)}: ${paid.id}. Line ${l.n} is shipped.\n`);
  } catch (err) {
    const e = err as Stripe.errors.StripeError & { needsCustomer?: boolean };
    if (!(e.needsCustomer || e.type === 'StripeCardError')) throw err;
    console.log(`\n  The saved card needs the customer (${e.code ?? e.message}). Stripe will email them an invoice instead.`);
    const inv = await s.invoices.create(
      {
        customer,
        collection_method: 'send_invoice',
        days_until_due: 7,
        pending_invoice_items_behavior: 'exclude',
        footer: balanceInvoiceFooter,
        metadata: meta,
      },
      { idempotencyKey: `balance-invoice-${r.pi.id}-${l.n}` },
    );
    /* Keyed too, so running this again after a failure part-way cannot put
       the same lines on the invoice twice. */
    await s.invoiceItems.create(
      { customer, invoice: inv.id, amount: balance, currency: 'usd', description: balanceInvoiceLine(label, l.ships) },
      { idempotencyKey: `balance-item-${r.pi.id}-${l.n}` },
    );
    if (ship > 0) {
      await s.invoiceItems.create(
        { customer, invoice: inv.id, amount: ship, currency: 'usd', description: shippingInvoiceLine(label) },
        { idempotencyKey: `balance-ship-${r.pi.id}-${l.n}` },
      );
    }
    await s.invoices.finalizeInvoice(inv.id!);
    await s.invoices.sendInvoice(inv.id!);
    await s.paymentIntents.update(r.pi.id, { metadata: { [`s${l.n}`]: stamp('awaiting-payment', inv.id!) } });
    console.log(`  Invoice ${inv.id} sent. Line ${l.n} is awaiting payment; ship it once the invoice is paid.\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
