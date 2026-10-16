# start-build

Emails the customer that we start building their reserved units on a given date, and marks those lines `building:<date>`. **No money moves.**

```bash
npm run shop:start-build -- <pi_…>                     # every line still reserved
npm run shop:start-build -- <pi_…> 1 2                 # lines 1 and 2
npm run shop:start-build -- <pi_…> --starts 2026-11-02 # pick the start date
```

## The start date
- The site promises: "Refundable in full until we start building yours. We email you before we do."
- So the email names the day we start. `--starts` defaults to three days from today, and can't be in the past.
- **Until that date:** a cancellation is refunded in full. `refund-deposit` allows it without `--force`.
- **From that date:** the terms keep the deposit, unless we miss the ship date.

## The email
- The text is in `scripts/shop/emails.ts`. It names the lines, the deposit, what's charged when they ship, the ship month, and the refund rule.
- It goes to the shop's email on the Stripe customer, through Resend (`RESEND_API_KEY`), with replies going to support@useclear.org.
- **Without a Resend key** it sends and marks nothing. It prints the email instead: send it yourself, then run the same command with `--sent-manually` to mark the lines.

Lines that aren't `reserved` (already building, shipped or refunded) are skipped, with a note.
