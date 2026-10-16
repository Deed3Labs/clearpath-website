/* Email the customer that we start building their reserved units on a
 * date, and mark those lines building.
 *   npm run shop:start-build -- <pi_…> [line …] [--starts YYYY-MM-DD] [--sent-manually] [--yes]
 * Until the start date a cancellation is refunded in full; from then it
 * keeps the deposit. No money moves. See README.md beside this file. */

import { startBuildEmail } from '../emails';
import {
  args,
  balanceOf,
  confirm,
  customerEmail,
  depositOf,
  fail,
  getReservation,
  lineLabel,
  loadEnv,
  pickLines,
  printEmail,
  sendEmail,
  shopName,
  statusOf,
  stripe,
  usdExact,
} from '../lib';

/* Three days' notice unless the owner says otherwise. */
function startDate(flag: string | true | undefined): string {
  if (typeof flag === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(flag) || Number.isNaN(Date.parse(flag))) fail('--starts takes a date like 2026-11-02.');
    if (flag < new Date().toISOString().slice(0, 10)) fail('--starts is in the past. The customer has to hear before we start.');
    return flag;
  }
  return new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
}

async function main() {
  loadEnv();
  const { pos, flags } = args();
  const [id, ...wanted] = pos;
  if (!id) fail('Usage: npm run shop:start-build -- <pi_…> [line …] [--starts YYYY-MM-DD]');
  const starts = startDate(flags.get('starts'));
  const s = stripe();
  const r = await getReservation(s, id);

  const picked = pickLines(r, wanted);
  const lines = picked.filter((l) => statusOf(l.status) === 'reserved');
  for (const l of picked) if (!lines.includes(l)) console.log(`  Skipping line ${l.n} (${lineLabel(l)}): it is ${l.status}.`);
  if (!lines.length) fail('Nothing to start: no chosen line is still reserved.');

  const to = customerEmail(r.pi);
  if (!to) fail(`${id} has no customer email to write to.`);

  const email = {
    to,
    ...startBuildEmail({
      shop: shopName(r.pi),
      lines: lines.map(lineLabel),
      deposit: usdExact(lines.reduce((n, l) => n + depositOf(l), 0)),
      balance: usdExact(lines.reduce((n, l) => n + balanceOf(l), 0)),
      ships: lines.map((l) => l.ships),
      starts,
    }),
  };

  await confirm(`Email ${to} that we start building ${lines.map((l) => `line ${l.n}`).join(', ')} on ${starts}, and mark ${lines.length > 1 ? 'them' : 'it'} building?`, flags.has('yes'));

  const sent = await sendEmail(email);
  if (!sent) {
    printEmail(email);
    if (!flags.has('sent-manually')) {
      fail('RESEND_API_KEY is not set, so nothing was sent or marked. Set it, or send the email above yourself and run this again with --sent-manually.');
    }
  }

  const marks: Record<string, string> = {};
  for (const l of lines) marks[`s${l.n}`] = `building:${starts}`;
  await s.paymentIntents.update(r.pi.id, { metadata: marks });
  console.log(`\n  ${sent ? 'Emailed' : 'Marked (emailed by hand)'}: ${lines.map(lineLabel).join('; ')}. Building from ${starts}.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
