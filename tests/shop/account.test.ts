import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_SHOP, mockToken, openSession, sealSession, shopAccountMode, verifyToken } from '@/lib/shop/shopAccount';

/* The test script runs with SHOP_ACCOUNT=mock, so the real verification
   path runs against the mock's key. */

test('a hand-off token verifies, and only with its own state', () => {
  const token = mockToken('state-1');
  assert.deepEqual(verifyToken(token, 'state-1'), MOCK_SHOP);
  assert.equal(verifyToken(token, 'state-2'), null);
  assert.equal(verifyToken('', 'state-1'), null);
});

test('a tampered, expired or over-long token is refused', () => {
  const token = mockToken('s');
  const [h, , sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ aud: 'useclear.org/shop', sub: 'someone-else', name: 'X', owner: 'Y', approval: 'approved', state: 's', iat: 0, exp: 9e9 })).toString('base64url');
  assert.equal(verifyToken(`${h}.${forged}.${sig}`, 's'), null);
  const now = Math.floor(Date.now() / 1000);
  assert.equal(verifyToken(mockToken('s', MOCK_SHOP, now - 3600), 's'), null, 'expired');
  assert.equal(verifyToken(token, 's', now + 11 * 60), null, 'past its exp');
});

test('the site session round-trips and refuses tampering', () => {
  const v = sealSession(MOCK_SHOP);
  assert.ok(v);
  assert.deepEqual(openSession(v), MOCK_SHOP);
  const [body, mac] = v.split('.');
  assert.equal(openSession(`${body}x.${mac}`), null);
  assert.equal(openSession(undefined), null);
});

test('the mock refuses to run on a production deploy', () => {
  const was = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'production';
  try {
    assert.equal(shopAccountMode(), 'off');
    assert.throws(() => mockToken('s'));
  } finally {
    if (was === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = was;
  }
});
