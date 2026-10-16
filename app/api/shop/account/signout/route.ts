import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/shop/shopAccount';

export const runtime = 'nodejs';

/* The Your shop step's Change: forget the shop on this browser. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
