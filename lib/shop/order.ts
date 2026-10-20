/* An order's arithmetic and its checkout steps, as pure functions.
 *
 * No catalog import and no Stripe import, so the bag (a client component)
 * reads the same totals the server charges. The server feeds these from
 * catalog.priceBag; the bag feeds them from the products it was given, for
 * display only. */

export type OrderLine = {
  slug: string;
  variant: string;
  qty: number;
  unitCents: number;
  preorder: boolean;
  depositCents: number;
  balanceCents: number;
  ships?: string;
};

export type Totals = {
  /* Goods at full price. */
  goodsCents: number;
  /* Every pre-order line's deposit × quantity. */
  depositsCents: number;
  /* Charged today: goods, the goods' shipping (once chosen) and deposits. */
  todayCents: number;
  /* Charged to the saved card as each pre-order ships, before its shipping. */
  laterCents: number;
};

export function totals(lines: OrderLine[], shippingCents: number | null): Totals {
  let goodsCents = 0;
  let depositsCents = 0;
  let laterCents = 0;
  for (const l of lines) {
    if (l.preorder) {
      depositsCents += l.depositCents * l.qty;
      laterCents += l.balanceCents * l.qty;
    } else {
      goodsCents += l.unitCents * l.qty;
    }
  }
  return { goodsCents, depositsCents, todayCents: goodsCents + depositsCents + (shippingCents ?? 0), laterCents };
}

/* Free shipping: once the goods that ship now come to $30, the cheapest
   way to send them is free, and a faster one costs only what it adds over
   that. Pre-order deposits do not count (they ship, and are charged for
   shipping, when they are built). The rates route and checkout both apply
   this, checkout from the carrier's own figures, never the browser's. */
export const FREE_SHIPPING_FROM_CENTS = 3000;

export function shippingCents(goodsCents: number, rateCents: number, cheapestCents: number): number {
  return goodsCents >= FREE_SHIPPING_FROM_CENTS ? Math.max(0, rateCents - cheapestCents) : rateCents;
}

export const hasGoods = (lines: Pick<OrderLine, 'preorder'>[]) => lines.some((l) => !l.preorder);
export const hasPreorder = (lines: Pick<OrderLine, 'preorder'>[]) => lines.some((l) => l.preorder);

/* The checkout steps for this bag, in order. Your shop only when it holds a
   pre-order; Choose shipping only when it holds goods (pre-orders ship
   later, and their shipping is charged then). The bag numbers them from
   this list, so a skipped step renumbers the rest. */
export type Step = 'shop' | 'addr' | 'ship' | 'pay';

export function steps(lines: Pick<OrderLine, 'preorder'>[]): Step[] {
  const out: Step[] = [];
  if (hasPreorder(lines)) out.push('shop');
  out.push('addr');
  if (hasGoods(lines)) out.push('ship');
  out.push('pay');
  return out;
}

/* The reservation record, one metadata key per pre-order line, in Stripe's
 * limits (50 keys, 40-character keys, 500-character values):
 *   r1 = "clear-point/table/4/8900/5500/Feb 2027"
 *        slug / variant / qty / price / deposit / ships
 *   s1 = "reserved"   the line's status: reserved → building → shipped,
 *                     or refunded. The owner scripts move it.
 * MAX_LINES (20) keeps this at 40 keys at most, plus the few others. */
export function reservationMetadata(lines: OrderLine[]): Record<string, string> {
  const out: Record<string, string> = {};
  lines
    .filter((l) => l.preorder)
    .forEach((l, i) => {
      out[`r${i + 1}`] = [l.slug, l.variant, l.qty, l.unitCents, l.depositCents, l.ships ?? ''].join('/');
      out[`s${i + 1}`] = 'reserved';
    });
  return out;
}

export type ReservedLine = { n: number; slug: string; variant: string; qty: number; unitCents: number; depositCents: number; ships: string; status: string };

/* The record back out of metadata: for the Reserved page and the owner's
   scripts. Lines that do not parse are skipped rather than guessed at. */
export function readReservation(meta: Record<string, string> | null | undefined): ReservedLine[] {
  const out: ReservedLine[] = [];
  if (!meta) return out;
  for (let n = 1; meta[`r${n}`]; n++) {
    const [slug, variant, qty, unit, dep, ...ships] = meta[`r${n}`].split('/');
    const q = Number(qty), u = Number(unit), d = Number(dep);
    if (!slug || !variant || !Number.isInteger(q) || !Number.isInteger(u) || !Number.isInteger(d)) continue;
    out.push({ n, slug, variant, qty: q, unitCents: u, depositCents: d, ships: ships.join('/'), status: meta[`s${n}`] ?? 'reserved' });
  }
  return out;
}
