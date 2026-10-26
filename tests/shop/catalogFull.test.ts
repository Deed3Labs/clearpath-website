import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../../content/shop';
import { full, GET } from '../../app/api/shop/catalog/route';

/* The catalog's full records, for Command's import (Phase 11): only with the token and ?full=1, and
   each one the content file's product less how it's drawn. */

process.env.COMMAND_CATALOG_TOKEN = 'token-for-tests';
const get = (url: string, token?: string) => GET(new Request(url, token ? { headers: { authorization: `Bearer ${token}` } } : {})).then((r) => r.json());

test('a full record is the product without its drawing: nothing else left out, nothing added', () => {
  for (const p of PRODUCTS) {
    const f = full(p) as Record<string, unknown>;
    assert.ok(!('tone' in f) && !('plate' in f) && !('media' in f), p.slug);
    const want: Record<string, unknown> = { ...p, alsoIn: p.alsoIn ?? [], colours: p.colours ?? [] };
    for (const k of ['tone', 'plate', 'media']) delete want[k];
    assert.deepEqual(f, want, p.slug);
  }
});

test('?full=1 needs the token: without it, the summary', async () => {
  const open = await get('https://www.useclear.org/api/shop/catalog?full=1');
  assert.ok(open.products.every((p: Record<string, unknown>) => !('description' in p)));
  const wrong = await get('https://www.useclear.org/api/shop/catalog?full=1', 'nope');
  assert.ok(wrong.products.every((p: Record<string, unknown>) => !('description' in p)));
  const whole = await get('https://www.useclear.org/api/shop/catalog?full=1', 'token-for-tests');
  assert.equal(whole.products.length, PRODUCTS.length);
  assert.deepEqual(whole.products[0], JSON.parse(JSON.stringify(full(PRODUCTS[0]))));
  assert.deepEqual(whole.moved, (await get('https://www.useclear.org/api/shop/catalog', 'token-for-tests')).moved);
  // with the token and no ?full=1, the summary as before
  assert.ok((await get('https://www.useclear.org/api/shop/catalog', 'token-for-tests')).products.every((p: Record<string, unknown>) => !('description' in p)));
});
