import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startBuildEmail } from '../../scripts/shop/emails';
import { args, balanceOf, dateOf, depositOf, lineLabel, nameOf, shippingCents, statusOf } from '../../scripts/shop/lib';
import { readReservation } from '@/lib/shop/order';

const lines = readReservation({
  r1: 'clear-point/table/4/8900/5500/Feb 2027',
  s1: 'building:2026-11-02',
  r2: 'clear-tap/m2/1/8900/8000/Mar 2027',
  s2: 'shipped:2026-12-01:pi_bal_1',
});

test('owner scripts read each line, its status and its money', () => {
  assert.deepEqual(lines.map((l) => [statusOf(l.status), dateOf(l.status)]), [['building', '2026-11-02'], ['shipped', '2026-12-01']]);
  assert.deepEqual(lines.map(depositOf), [22000, 8000]);
  assert.deepEqual(lines.map(balanceOf), [13600, 900]);
  assert.deepEqual(lines.map(lineLabel), ['4 × Clear Point, Table', 'Clear Tap, With an M2']);
  assert.equal(nameOf({ slug: 'clear-drawer', variant: 'one' }), 'Clear Drawer');
  assert.equal(statusOf('reserved'), 'reserved');
});

test('shipping must be given in dollars and cents, even when it is 0', () => {
  assert.equal(shippingCents('13.60'), 1360);
  assert.equal(shippingCents('0'), 0);
  assert.equal(shippingCents('9'), 900);
  assert.equal(shippingCents(undefined), null);
  assert.equal(shippingCents(true), null);
  assert.equal(shippingCents('-5'), null);
  assert.equal(shippingCents('1.234'), null);
});

test('arguments: positionals, flags and valued flags', () => {
  const a = args(['pi_1', '2', '--shipping', '9.00', '--yes', '--starts=2026-11-02']);
  assert.deepEqual(a.pos, ['pi_1', '2']);
  assert.equal(a.flags.get('shipping'), '9.00');
  assert.equal(a.flags.get('yes'), true);
  assert.equal(a.flags.get('starts'), '2026-11-02');
});

test('the build email names the start date, the deposit and the refund rule', () => {
  const e = startBuildEmail({ shop: 'Mi Casa Tacos', lines: ['4 × Clear Point, Table'], deposit: '$220.00', balance: '$136.00', ships: ['Feb 2027'], starts: '2026-11-02' });
  assert.equal(e.subject, "We're about to build your Clear Point, Table");
  assert.match(e.text, /We start building these on 2026-11-02:/);
  assert.match(e.text, /Your deposit for this is \$220\.00/);
  assert.match(e.text, /Reply to this email before 2026-11-02 and the whole deposit comes back/);
  assert.match(e.text, /unless we miss the ship date/);
});
