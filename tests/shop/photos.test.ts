import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOurPhoto, photoPath, removePhoto, storePhoto } from '../../lib/shop/photos';
import { DELETE, POST } from '../../app/api/shop/photos/route';

/* Product photos (the Command Center's Phase 11d): stored under shop/<product>/ in the site's
   Blob store, only with the token, and only photos stored here can be deleted. */

process.env.COMMAND_CATALOG_TOKEN = 'tok';
const req = (method: string, url: string, init: RequestInit = {}) => new Request(url, { method, ...init });

test('a photo’s path: its product’s folder and a cleaned name; a bad product or type is none', () => {
  assert.equal(photoPath('logotee', 'IMG 2041 (front).JPG', 'image/jpeg'), 'shop/logotee/img-2041-front.jpg');
  assert.equal(photoPath('clearpoint', '', 'image/webp'), 'shop/clearpoint/photo.webp');
  assert.equal(photoPath('../etc', 'x.png', 'image/png'), null);
  assert.equal(photoPath('logotee', 'x.gif', 'image/gif'), null);
});

test('only this store’s photos under shop/ are ours', () => {
  assert.equal(isOurPhoto('https://abc123.public.blob.vercel-storage.com/shop/logotee/front-x1y2.jpg'), true);
  assert.equal(isOurPhoto('https://abc123.public.blob.vercel-storage.com/other/x.jpg'), false);
  assert.equal(isOurPhoto('https://evil.example/shop/x.jpg'), false);
  assert.equal(isOurPhoto('http://abc123.public.blob.vercel-storage.com/shop/x.jpg'), false);
  assert.equal(isOurPhoto('not a url'), false);
});

test('stored public, with a random suffix and a year’s cache; deleting refuses anything not ours', async () => {
  const calls: unknown[] = [];
  const put = (async (path: string, _body: unknown, opts: unknown) => {
    calls.push([path, opts]);
    return { url: `https://abc123.public.blob.vercel-storage.com/${path.replace('.jpg', '-r4nd.jpg')}` };
  }) as never;
  assert.equal(await storePhoto('shop/logotee/front.jpg', new Uint8Array([1, 2]), 'image/jpeg', { put }), 'https://abc123.public.blob.vercel-storage.com/shop/logotee/front-r4nd.jpg');
  assert.deepEqual(calls, [['shop/logotee/front.jpg', { access: 'public', contentType: 'image/jpeg', addRandomSuffix: true, cacheControlMaxAge: 31536000 }]]);
  const gone: string[] = [];
  const del = (async (u: string) => void gone.push(u)) as never;
  assert.equal(await removePhoto('https://evil.example/shop/x.jpg', { del }), false);
  assert.equal(await removePhoto('https://abc123.public.blob.vercel-storage.com/shop/logotee/front-r4nd.jpg', { del }), true);
  assert.deepEqual(gone, ['https://abc123.public.blob.vercel-storage.com/shop/logotee/front-r4nd.jpg']);
});

test('the route: the token, a photo’s type, its size and its product, before anything is stored', async () => {
  const U = 'https://www.useclear.org/api/shop/photos?product=logotee&name=front.jpg';
  const auth = { authorization: 'Bearer tok' };
  assert.equal((await POST(req('POST', U, { headers: { 'content-type': 'image/jpeg' }, body: new Uint8Array([1]) }))).status, 401);
  assert.equal((await POST(req('POST', U, { headers: { ...auth, 'content-type': 'image/gif' }, body: new Uint8Array([1]) }))).status, 415);
  assert.equal((await POST(req('POST', U.replace('logotee', '..'), { headers: { ...auth, 'content-type': 'image/jpeg' }, body: new Uint8Array([1]) }))).status, 400);
  assert.equal((await POST(req('POST', U, { headers: { ...auth, 'content-type': 'image/jpeg' }, body: new Uint8Array(0) }))).status, 400);
  assert.equal((await POST(req('POST', U, { headers: { ...auth, 'content-type': 'image/jpeg' }, body: new Uint8Array(4 * 1024 * 1024 + 1) }))).status, 413);
  assert.equal((await DELETE(req('DELETE', 'https://www.useclear.org/api/shop/photos', { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'x' }) }))).status, 401);
  assert.equal((await DELETE(req('DELETE', 'https://www.useclear.org/api/shop/photos', { headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://evil.example/shop/x.jpg' }) }))).status, 400);
});
