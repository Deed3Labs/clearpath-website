# charge-balance

When a line ships, charges its balance (price less deposit, times quantity) plus its shipping to the card the customer saved at checkout.

```bash
npm run shop:charge-balance -- <pi_…> <line> --shipping 13.60
npm run shop:charge-balance -- <pi_…> <line> --shipping 0
```

## Before you run it
- **`--shipping` is required**, in dollars: what the label cost (buy it in Shippo first), or `0`. It's never left off by accident.
- **The line must be `building`:** run `start-build` first. `--force` charges a line that's still `reserved`; use it only if the customer already knows it's coming.
- **Already settled?** It refuses a line that's `shipped`, `refunded` or `awaiting-payment`.

## What happens
1. It confirms the amount with you.
2. It charges the saved card off-session (`off_session: true`). The idempotency key is per line, so running it twice can't charge twice.
3. **Success:** the line becomes `shipped:<date>:<pi>`, and Stripe emails a receipt if receipts are on.
4. **The bank wants the customer to confirm, or the card is declined:** no charge is made. Instead it creates a Stripe invoice for the same amount (the rest, plus shipping), due in 7 days. Stripe emails it to the customer with a pay link, and the line becomes `awaiting-payment:<date>:<invoice>`. **Ship once the invoice is paid** (you'll see it in the Stripe dashboard).

## Sales tax
- `TODO(owner)`: deposits aren't taxed. If you switch on sales tax, the tax on the unit belongs on this charge.
- Ask the accountant before the first live order.
