/* The words the owner's scripts send. Plain text, like the rest of Clear's
 * transactional email. Edit here, not in the scripts.
 * TODO(owner): read these once before the first real build. */

import { SUPPORT_EMAIL } from '@/content/shop';

export function startBuildEmail(o: { shop: string; lines: string[]; deposit: string; balance: string; ships: string[]; starts: string }) {
  return {
    subject: `We're about to build your ${o.lines.length > 1 ? 'hardware' : o.lines[0].replace(/^\d+ × /, '')}`,
    text: [
      `Hello ${o.shop},`,
      '',
      `We start building these on ${o.starts}:`,
      ...o.lines.map((l) => `  - ${l}`),
      '',
      `Your deposit for ${o.lines.length > 1 ? 'these' : 'this'} is ${o.deposit}. When ${o.lines.length > 1 ? 'each piece ships' : 'it ships'}, we charge the rest (${o.balance}, plus shipping) to the card you saved at checkout, and email you the tracking.`,
      `Estimated ship ${o.ships.length > 1 ? 'months' : 'month'}: ${[...new Set(o.ships)].join(', ')}.`,
      '',
      `Changed your mind? Reply to this email before ${o.starts} and the whole deposit comes back. From that day the deposit is no longer refundable, unless we miss the ship date, in which case you can still cancel for a full refund.`,
      '',
      `Questions: reply here, or write to ${SUPPORT_EMAIL}.`,
      '',
      'Clear',
    ].join('\n'),
  };
}

/* The line on the invoice Stripe emails when the saved card needs the
   customer (or was declined) at shipping. */
export const balanceInvoiceLine = (line: string, ships: string) => `The rest for ${line} (ships ${ships}), after your deposit`;
export const shippingInvoiceLine = (line: string) => `Shipping for ${line}`;
export const balanceInvoiceFooter = `Your card on file could not be charged without you. Pay here and we ship it. Questions: ${SUPPORT_EMAIL}.`;
