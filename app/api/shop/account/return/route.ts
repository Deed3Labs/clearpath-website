import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sealSession, SESSION_COOKIE, SESSION_SECONDS, STATE_COOKIE, verifyToken } from '@/lib/shop/shopAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Back from the merchant app with ?token=…&state=…. The state must match the
   one-time cookie set by /connect, so a token minted for someone else's
   sign-in cannot be planted on this browser. The token is verified against
   the Clear API's key, then the shop is kept in the site's own session and
   the token itself is dropped. Either way the customer lands back on the
   same bag. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value ?? '';
  const sent = url.searchParams.get('state') ?? '';
  const shop = expected && sent === expected ? verifyToken(url.searchParams.get('token') ?? '', expected) : null;
  const session = shop && sealSession(shop);

  const res = NextResponse.redirect(new URL(`/shop/bag?shop=${session ? 'in' : 'failed'}`, url.origin));
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.cookies.set(STATE_COOKIE, '', { path: '/api/shop/account', maxAge: 0 });
  if (session) {
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      path: '/',
      maxAge: SESSION_SECONDS,
    });
  } else {
    console.warn('[shop/account] hand-off refused', { stateMatched: !!expected && sent === expected });
  }
  return res;
}
