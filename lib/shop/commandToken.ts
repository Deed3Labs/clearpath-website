import { createHash, timingSafeEqual } from 'node:crypto';

/* Whether a request carries the Command Center's shared token
   (COMMAND_CATALOG_TOKEN, the same value in the API's env), compared as
   hashes so the comparison takes the same time whatever the length. */
export function isCommand(header: string | null): boolean {
  const want = process.env.COMMAND_CATALOG_TOKEN?.trim();
  const got = header?.replace(/^Bearer\s+/i, '').trim();
  if (!want || !got) return false;
  const a = createHash('sha256').update(want).digest();
  const b = createHash('sha256').update(got).digest();
  return timingSafeEqual(a, b);
}
