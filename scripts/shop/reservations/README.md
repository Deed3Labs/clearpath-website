# reservations

Lists reservations, newest first, with every line's quantity, deposit, the rest still to charge, its ship month and its status. Read-only.

```bash
npm run shop:reservations
npm run shop:reservations -- --all
npm run shop:reservations -- --shop <shop id>
```

- **Default:** shows reservations with at least one line still open (not shipped or refunded).
- **`--all`:** includes finished ones too.
- **`--shop <id>`:** limits the list to one shop (its id is the org wallet address the merchant app uses).

Output looks like:

```
  pi_3Q…  2026-10-16  Mi Casa Tacos (0xabc…)
    1. 4 × Clear Point, Table    deposit $220.00  rest $136.00  ships Feb 2027  reserved
    2. Clear Tap, With an M2     deposit  $80.00  rest   $9.00  ships Mar 2027  building:2026-11-02
```

Use the `pi_…` id and the line number with the other scripts.

- **Lag:** Stripe's search can lag about a minute behind a new payment.
- **`[not stamped by the webhook]`:** the order was paid but the webhook didn't mark it. Check the webhook endpoint in the Stripe dashboard.
