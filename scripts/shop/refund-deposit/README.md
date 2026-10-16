# refund-deposit

Refunds deposits in full: every open line of a reservation, or just the lines you name. Goods and shipping in the same order are not touched.

```bash
npm run shop:refund-deposit -- <pi_…>          # every open line
npm run shop:refund-deposit -- <pi_…> 2        # line 2 only
npm run shop:refund-deposit -- <pi_…> 2 --force
```

## When it's allowed

| Line status | Refund |
|---|---|
| `reserved` | Yes |
| `building:<date>`, before that date | Yes: the customer cancelled within the notice the build email gave |
| `building:<date>`, on or after it | Only with `--force`. The terms keep the deposit, but a missed ship date, or an FCC authorization that's refused, is a reason to refund anyway |
| `awaiting-payment` | No. Void the open invoice in the Stripe dashboard first, then run it again |
| `shipped` or `refunded` | Skipped |

## What happens
- It confirms the amount with you, then makes one refund on the original payment (with an idempotency key), and marks each line `refunded:<date>:<refund>`.
- Stripe emails the customer a refund receipt if receipts are on.
- **Shops the Clear API declines** are refunded automatically by the daily cron (`app/api/shop/cron/declined`), once the API can report approval. You don't need this script for them.
