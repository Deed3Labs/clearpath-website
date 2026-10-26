import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../../content/shop';
import { full } from '../../lib/shop/fullRecord';
import { forgetLastCatalog, fromCommand, shopCatalog } from '../../lib/shop/source';
import { POST as revalidate } from '../../app/api/shop/revalidate/route';

/* Where the shop's catalog comes from (the Command Center's Phase 11c): Command's when
   COMMAND_CATALOG_URL is set, with each product's drawing from the content file; the last good
   copy, then the content file, when Command doesn't answer. */

const URL_ = 'https://api.test/api/command/catalog';
/* Command's answer for the content file's products: the full record without the drawing, as the
   API's publicCatalog sends it (JSON leaves out what's undefined). */
const commandAnswer = () => ({ products: JSON.parse(JSON.stringify(PRODUCTS.map(full))), moved: {} });
const answering = (body: unknown, status = 200) => {
  const asked: Array<{ url: string; init?: RequestInit & { next?: unknown } }> = [];
  const f = (async (url: string, init?: RequestInit) => {
    asked.push({ url, init: init as RequestInit & { next?: unknown } });
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return { f, asked };
};

test('without COMMAND_CATALOG_URL, the content file, as it always was', async () => {
  assert.equal(await shopCatalog({}), PRODUCTS);
});

test('Command’s products come back as the content file’s, drawing and all: nothing lost, nothing added', () => {
  assert.deepEqual(fromCommand(commandAnswer().products), JSON.parse(JSON.stringify(PRODUCTS)));
});

test('it asks with the token, cached a minute under the tag the revalidate clears', async () => {
  forgetLastCatalog();
  const { f, asked } = answering(commandAnswer());
  const got = await shopCatalog({ COMMAND_CATALOG_URL: URL_, COMMAND_CATALOG_TOKEN: 'tok' }, f);
  assert.equal(got.length, PRODUCTS.length);
  assert.equal(asked[0].url, URL_);
  assert.equal(new Headers(asked[0].init?.headers).get('authorization'), 'Bearer tok');
  assert.deepEqual(asked[0].init?.next, { revalidate: 60, tags: ['shop-catalog'] });
});

test('an edit in Command is what the shop sells: a new price, a sold-out size, a product the file doesn’t know', async () => {
  forgetLastCatalog();
  const a = commandAnswer();
  a.products[0].priceCents = 3100;
  a.products[0].variants[1].soldOut = true;
  a.products.push({ ...a.products[0], slug: 'logo-crewneck', name: 'Logo Crewneck', kind: 'hoodie', colours: [{ id: 'land', label: 'Land', swatch: '#6B7F5C', tone: 'land' }], status: 'draft' });
  const got = await shopCatalog({ COMMAND_CATALOG_URL: URL_ }, answering(a).f);
  assert.equal(got[0].priceCents, 3100);
  assert.equal(got[0].variants[1].soldOut, true);
  assert.deepEqual(got[0].media, PRODUCTS[0].media);
  const crew = got.find((p) => p.slug === 'logo-crewneck')!;
  // drawn on its first colour's ground, with its kind's plain plate
  assert.equal(crew.tone, 'land');
  assert.equal(crew.plate, undefined);
  assert.equal(crew.media, undefined);
});

test('Command down or wrong: the last catalog read, and failing that the content file', async () => {
  forgetLastCatalog();
  const env = { COMMAND_CATALOG_URL: URL_ };
  assert.equal(await shopCatalog(env, answering({ error: 'down' }, 503).f), PRODUCTS);
  const good = commandAnswer();
  good.products[0].priceCents = 2900;
  await shopCatalog(env, answering(good).f);
  // a 500, nothing, a product with no price, or no answer at all: the last good one
  for (const bad of [answering({}, 500).f, answering({ products: [] }).f, answering({ products: [{ ...good.products[0], priceCents: 0 }] }).f]) assert.equal((await shopCatalog(env, bad))[0].priceCents, 2900);
  const throws = (async () => {
    throw new Error('offline');
  }) as unknown as typeof fetch;
  assert.equal((await shopCatalog(env, throws))[0].priceCents, 2900);
  forgetLastCatalog();
});

test('the revalidate route needs the token', async () => {
  process.env.COMMAND_CATALOG_TOKEN = 'tok';
  const r = await revalidate(new Request('https://www.useclear.org/api/shop/revalidate', { method: 'POST', headers: { authorization: 'Bearer nope' } }));
  assert.equal(r.status, 401);
  const none = await revalidate(new Request('https://www.useclear.org/api/shop/revalidate', { method: 'POST' }));
  assert.equal(none.status, 401);
});
