# Shop owner tools

Small scripts for the hardware pre-orders, run by the owner from the repo. The site never runs them, and nothing here runs on a schedule.

| Script | What it does | Moves money |
|---|---|---|
| [`reservations`](reservations/README.md) | Lists reservations with each line's status and ship month | No |
| [`start-build`](start-build/README.md) | Emails the customer the date we start building, and marks the lines building | No |
| [`charge-balance`](charge-balance/README.md) | Charges a line's balance plus shipping to the saved card when it ships; if the card needs the customer, Stripe emails an invoice instead | Yes |
| [`refund-deposit`](refund-deposit/README.md) | Refunds deposits in full | Yes |

## Setup
Put the keys in `.env.local` at the repo root; the scripts read it the way `next dev` does:

```
STRIPE_SECRET_KEY=sk_test_…     # sk_live_… for real orders
RESEND_API_KEY=re_…             # for start-build's email; optional, see below
RESEND_FROM=Clear <hello@useclear.org>
```

- **The mode is shown everywhere.** Every script prints whether it's in **test** or **LIVE** mode before it changes anything.
- **Resend** is the email service the Clear API already uses. Its from address must be on a domain verified in Resend. Without a key, `start-build` prints the email for you to send by hand.
- Use Node 22. Run each script with `npm run shop:<name> -- <arguments>`.

## Where the record lives
- Until the Clear API holds reservations, **Stripe is the record**. Checkout writes one metadata key per pre-order line on the reservation's PaymentIntent (the `pi_…` id these scripts take), with a status beside it:

  | Status | Set by | Means |
  |---|---|---|
  | `reserved` | checkout (the webhook stamps `reserved_at`) | Deposit paid |
  | `building:<date>` | `start-build` | Customer told we start on `<date>`. Before that date a cancellation is refunded in full; from it, the deposit is kept |
  | `shipped:<date>:<pi>` | `charge-balance` | The rest was charged |
  | `awaiting-payment:<date>:<invoice>` | `charge-balance` | The card needed the customer; Stripe emailed an invoice |
  | `refunded:<date>:<refund>` | `refund-deposit`, or the declined-shop cron | Deposit refunded |

- You can read the same keys on the PaymentIntent in the Stripe dashboard.

## Safety
- **Confirmation:** anything that moves money or emails a customer asks you to type `yes`. `--yes` skips the question, for when you've already checked.
- **No double charges or refunds:** charges and refunds carry idempotency keys, so running a command twice can't charge or refund twice.
- **Nothing runs on its own:** no script ever charges or refunds automatically. The only automatic money movement in the shop is the declined-shop deposit refund (`app/api/shop/cron/declined`), and that waits for the Clear API to report approval.
- **Testing the scripts themselves:** `STRIPE_API_BASE` points them at a local stand-in (stripe-mock, or the fake the tests use). Never set it for real work.
