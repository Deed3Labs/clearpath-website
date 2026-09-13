import { Shippo } from 'shippo';
import type { PricedLine } from './catalog';

/* Shippo: quote live rates for an address, re-read a rate by id, and buy the
   label once an order is paid. Test and live are separate API tokens
   (shippo_test_… / shippo_live_…); test tokens return real-looking rates and
   free, void labels. */
let cached: Shippo | null = null;

export function getShippo(): Shippo {
  if (cached) return cached;
  const key = process.env.SHIPPO_API_KEY;
  if (!key) throw new Error('SHIPPO_API_KEY is not set.');
  cached = new Shippo({ apiKeyHeader: `ShippoToken ${key}` });
  return cached;
}

export type ShipAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
};

/* Where parcels leave from. Shippo quotes nothing without a real origin — it
   returns a shipment with no rates and a list of carrier complaints — so this
   is checked up front and reported as setup, not as the customer's address
   being wrong. */
export function shipFrom(): ShipAddress {
  return {
    name: process.env.SHIP_FROM_NAME || 'Clear Cooperative',
    street1: process.env.SHIP_FROM_STREET1 ?? '',
    street2: process.env.SHIP_FROM_STREET2 || undefined,
    city: process.env.SHIP_FROM_CITY ?? '',
    state: process.env.SHIP_FROM_STATE ?? '',
    zip: process.env.SHIP_FROM_ZIP ?? '',
    country: process.env.SHIP_FROM_COUNTRY || 'US',
    phone: process.env.SHIP_FROM_PHONE || undefined,
    email: process.env.SHIP_FROM_EMAIL || undefined,
  };
}

export function isShippoConfigured(): boolean {
  const from = shipFrom();
  return Boolean(process.env.SHIPPO_API_KEY && from.street1 && from.city && from.state && from.zip);
}

/* One parcel for the whole bag.
 *
 * Soft goods go in a poly mailer; a cap needs a box or it arrives crushed.
 * Dimensions only have to be close enough that the quoted rate covers the
 * real one — carriers bill on weight and size bands, not the millimetre.
 * TODO(owner): re-measure against real packed orders once stock exists.
 */
export function parcelFor(lines: PricedLine[]) {
  const units = lines.reduce((n, l) => n + l.qty, 0);
  const weightOz = lines.reduce((n, l) => n + l.product.weightOz * l.qty, 0) + 3; // packaging
  const boxed = lines.some((l) => l.product.kind === 'cap');
  const [length, width, height] = boxed ? [10, 10, 6] : [12, 10, 2];
  // Grow the parcel with the unit count rather than stepping boxes by hand.
  const scale = Math.cbrt(Math.max(1, Math.ceil(units / 3)));
  return {
    length: (length * scale).toFixed(1),
    width: (width * scale).toFixed(1),
    height: (height * scale).toFixed(1),
    distanceUnit: 'in' as const,
    weight: weightOz.toFixed(1),
    massUnit: 'oz' as const,
  };
}

export type Quote = {
  rateId: string;
  label: string;
  amountCents: number;
  estimatedDays: number | null;
};

export async function quoteRates(to: ShipAddress, lines: PricedLine[]): Promise<Quote[]> {
  const shipment = await getShippo().shipments.create({
    addressFrom: shipFrom(),
    addressTo: to,
    parcels: [parcelFor(lines)],
    async: false,
  });

  return (shipment.rates ?? [])
    .map((r) => ({
      rateId: r.objectId,
      label: [r.provider, r.servicelevel?.name].filter(Boolean).join(' ') || 'Shipping',
      amountCents: Math.round(Number(r.amount) * 100),
      estimatedDays: r.estimatedDays ?? null,
    }))
    .filter((r) => Number.isFinite(r.amountCents) && r.amountCents > 0)
    .sort((a, b) => a.amountCents - b.amountCents);
}

/* The bag posts back a rate id, and the amount for it is about to be charged.
   The browser is not a source for that amount, so checkout reads the rate
   from Shippo again and bills what the carrier quoted. */
export async function getRate(rateId: string): Promise<Quote> {
  const r = await getShippo().rates.get(rateId);
  const amountCents = Math.round(Number(r.amount) * 100);
  if (!Number.isFinite(amountCents)) throw new Error('rate has no amount');
  return {
    rateId: r.objectId,
    label: [r.provider, r.servicelevel?.name].filter(Boolean).join(' ') || 'Shipping',
    amountCents,
    estimatedDays: r.estimatedDays ?? null,
  };
}

/* Spends real money on the Shippo account, so only the webhook calls it, and
   only when SHIPPO_AUTO_BUY_LABEL=true. */
export async function buyLabel(rateId: string) {
  return getShippo().transactions.create({ rate: rateId, labelFileType: 'PDF_4x6', async: false });
}
