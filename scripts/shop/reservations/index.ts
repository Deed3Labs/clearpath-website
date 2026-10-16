/* List reservations, newest first, with each line's status and ship month.
 *   npm run shop:reservations [-- --all] [-- --shop <shop id>]
 * Read-only. See README.md beside this file. */

import type Stripe from 'stripe';
import { readReservation } from '@/lib/shop/order';
import { args, balanceOf, depositOf, lineLabel, loadEnv, modeLabel, shopName, statusOf, stripe, usdExact } from '../lib';

async function main() {
  loadEnv();
  const { flags } = args();
  const s = stripe();
  const shop = typeof flags.get('shop') === 'string' ? (flags.get('shop') as string).replace(/'/g, '') : null;

  const found: Stripe.PaymentIntent[] = [];
  let page: string | undefined;
  do {
    const res = await s.paymentIntents.search({
      query: `metadata['kind']:'reservation' AND status:'succeeded'${shop ? ` AND metadata['shop_id']:'${shop}'` : ''}`,
      limit: 100,
      ...(page && { page }),
    });
    found.push(...res.data);
    page = res.has_more ? res.next_page ?? undefined : undefined;
  } while (page);

  console.log(`\n  Reservations (${modeLabel()} mode). Stripe's search can lag a minute behind new payments.\n`);
  let shown = 0;
  for (const pi of found.sort((a, b) => b.created - a.created)) {
    const lines = readReservation(pi.metadata);
    const open = lines.some((l) => !['shipped', 'refunded'].includes(statusOf(l.status)));
    if (!open && !flags.has('all')) continue;
    shown++;
    const when = new Date(pi.created * 1000).toISOString().slice(0, 10);
    console.log(`  ${pi.id}  ${when}  ${shopName(pi)} (${pi.metadata.shop_id})${pi.metadata.reserved_at ? '' : '  [not stamped by the webhook]'}`);
    for (const l of lines) {
      console.log(
        `    ${l.n}. ${lineLabel(l).padEnd(36)} deposit ${usdExact(depositOf(l)).padStart(10)}  rest ${usdExact(balanceOf(l)).padStart(10)}  ships ${l.ships.padEnd(9)} ${l.status}`,
      );
    }
    console.log('');
  }
  if (!shown) console.log(flags.has('all') ? '  None yet.\n' : '  No open reservations. --all lists shipped and refunded ones too.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
