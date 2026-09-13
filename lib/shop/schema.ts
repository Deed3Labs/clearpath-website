import { z } from 'zod';
import { MAX_LINES, MAX_PER_LINE } from '@/content/shop';

/* What the bag is allowed to send. Shapes only — whether a line is actually
   for sale is catalog.priceBag's job. */
export const Lines = z
  .array(
    z.object({
      slug: z.string().min(1).max(80),
      variant: z.string().min(1).max(40),
      qty: z.number().int().min(1).max(MAX_PER_LINE),
    }),
  )
  .min(1)
  .max(MAX_LINES);

/* US only: an international parcel needs a customs declaration per item,
   which is a separate piece of work. */
export const Address = z.object({
  name: z.string().trim().min(1).max(120),
  street1: z.string().trim().min(1).max(160),
  street2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(2).max(40),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
  country: z.literal('US'),
});

export const RatesBody = z.object({ lines: Lines, address: Address });

export const CheckoutBody = z.object({
  lines: Lines,
  address: Address,
  email: z.string().trim().email().max(160),
  rateId: z.string().min(1).max(120),
});
