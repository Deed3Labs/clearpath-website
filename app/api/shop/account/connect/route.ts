import { NextResponse } from 'next/server';
import { connectUrl, mockToken, newState, shopAccountMode, STATE_COOKIE } from '@/lib/shop/shopAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* "Sign in to your shop" and "Set up a shop" (?setup=1). Sets a one-time
   state cookie and hands off to the merchant app, which comes back to
   /api/shop/account/return. The mock skips the merchant app and comes back
   at once with its sample shop. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = shopAccountMode();
  if (mode === 'off') return NextResponse.redirect(new URL('/shop/bag?shop=off', url.origin));

  const state = newState();
  const back = new URL('/api/shop/account/return', url.origin).toString();
  const to =
    mode === 'mock'
      ? `${back}?${new URLSearchParams({ token: mockToken(state), state })}`
      : connectUrl(back, state, url.searchParams.get('setup') === '1');

  const res = NextResponse.redirect(to);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    path: '/api/shop/account',
    maxAge: 15 * 60,
  });
  return res;
}
