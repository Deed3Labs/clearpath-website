import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beforeSend, cleanUrl, tracker } from '../components/analytics/Analytics';

/* Umami on useclear.org: only the co-op's own tracker loads, and an address is counted without its
   hash or any parameter but utm_ (a poster's QR says utm_source=poster). */

const ID = '3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f';

test('the tracker is an https script with the site’s id, and nothing else', () => {
  assert.deepEqual(tracker('https://umami.useclear.org/script.js', ID), { src: 'https://umami.useclear.org/script.js', id: ID });
  assert.deepEqual(tracker(' https://umami.useclear.org/script.js ', ` ${ID} `), { src: 'https://umami.useclear.org/script.js', id: ID });
  assert.equal(tracker('http://umami.useclear.org/script.js', ID), null);
  assert.equal(tracker('https://umami.useclear.org/script.js?x=1', ID), null);
  assert.equal(tracker('javascript:alert(1)', ID), null);
  assert.equal(tracker('https://umami.useclear.org/script.js', 'not-an-id'), null);
  assert.equal(tracker('', ID), null);
  assert.equal(tracker(undefined, undefined), null);
});

test('an address keeps only its utm_ parameters, whole or as a path', () => {
  assert.equal(cleanUrl('https://www.useclear.org/join?as=shop&utm_source=poster&utm_campaign=P-12&email=a@b.c#top'), 'https://www.useclear.org/join?utm_source=poster&utm_campaign=P-12');
  assert.equal(cleanUrl('https://www.useclear.org/'), 'https://www.useclear.org/');
  assert.equal(cleanUrl('/join?email=a@b.c&utm_source=poster'), '/join?utm_source=poster');
  assert.equal(cleanUrl(''), '');
});

test('every event leaves cleaned, its page and where it came from', () => {
  const out = beforeSend('event', { website: ID, url: 'https://www.useclear.org/join?email=a@b.c&utm_source=poster', referrer: 'https://news.example/post?id=9#c', name: 'Join' });
  assert.deepEqual(out, { website: ID, url: 'https://www.useclear.org/join?utm_source=poster', referrer: 'https://news.example/post', name: 'Join' });
});
