import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl, scriptSrc } from '../components/analytics/Analytics';

/* Plausible on useclear.org: only the site's own snippet loads, and an address is counted without its
   hash or any parameter but utm_ (a poster's QR says utm_source=poster). */

test('the snippet is the site’s own, by id or whole URL, and nothing else', () => {
  assert.equal(scriptSrc('pa-abc123XYZ'), 'https://plausible.io/js/pa-abc123XYZ.js');
  assert.equal(scriptSrc('pa-abc123XYZ.js'), 'https://plausible.io/js/pa-abc123XYZ.js');
  assert.equal(scriptSrc('https://plausible.io/js/pa-abc123XYZ.js'), 'https://plausible.io/js/pa-abc123XYZ.js');
  assert.equal(scriptSrc('https://evil.example/x.js'), null);
  assert.equal(scriptSrc(''), null);
  assert.equal(scriptSrc(undefined), null);
});

test('an address keeps only its utm_ parameters', () => {
  assert.equal(cleanUrl('https://www.useclear.org/join?as=shop&utm_source=poster&utm_campaign=P-12&email=a@b.c#top'), 'https://www.useclear.org/join?utm_source=poster&utm_campaign=P-12');
  assert.equal(cleanUrl('https://www.useclear.org/'), 'https://www.useclear.org/');
});
