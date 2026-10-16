import { cookies } from 'next/headers';
import { openSession, SESSION_COOKIE, type Shop } from './shopAccount';

/* The shop signed in on this browser, verified, or null. Server only. */
export async function currentShop(): Promise<Shop | null> {
  const jar = await cookies();
  return openSession(jar.get(SESSION_COOKIE)?.value);
}
