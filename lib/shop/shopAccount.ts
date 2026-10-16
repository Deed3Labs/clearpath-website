import { createHmac, createPublicKey, generateKeyPairSync, randomBytes, sign, timingSafeEqual, verify, type KeyObject } from 'node:crypto';

/* The shop account: who is checking out a pre-order.
 *
 * Hardware is sold to shops on Clear only. The site has no merchant sign-in
 * of its own, so it hands off to the merchant app and takes back a signed
 * token:
 *
 *   1. The bag's "Sign in to your shop" / "Set up a shop" goes to
 *      /api/shop/account/connect, which sets a one-time `state` cookie and
 *      redirects to  merchant.useclear.org/connect?return=…&state=…[&setup=1].
 *   2. The merchant app signs the owner in (or runs setup) and redirects back
 *      with GET  /api/shop/account/return?token=…&state=…
 *   3. The site verifies the token against the Clear API's public key, checks
 *      the state, and keeps the shop in its own signed session cookie.
 *
 * The token (the monorepo builds the issuing side; see the Phase 1 report):
 *   a compact JWS, header {"alg":"EdDSA","typ":"JWT"}, signed with the API's
 *   Ed25519 key. Claims:
 *     aud      "useclear.org/shop"
 *     sub      the shop id (the org wallet address)
 *     name     the shop's name          owner    the owner's name
 *     email    the owner's email        approval "pending" | "approved" | "declined"
 *     address  { line1, line2?, city, state, zip, country }
 *     founding true for a founding partner
 *     state    the value the site sent  iat, exp at most 15 minutes apart
 *   The merchant app only returns to an allowlisted address (useclear.org and
 *   its previews), or the token could be handed to any site.
 *
 * SHOP_ACCOUNT picks the adapter:
 *   clear  the real hand-off. Needs CLEAR_API_PUBLIC_KEY (PEM, Ed25519) and
 *          SHOP_SESSION_SECRET; SHOP_API_KEY and CLEAR_API_URL for approval.
 *   mock   no merchant app: "Sign in" returns a sample shop, signed with a key
 *          made at start-up, so the real verification path still runs. It
 *          refuses to run on a production deploy, so a real deposit can never
 *          be taken against a pretend shop.
 *   unset  pre-orders cannot be checked out at all.
 *
 * The shop id only ever comes from a verified token, never from a request. */

export type ShopApproval = 'pending' | 'approved' | 'declined';
export type ShopAddress = { line1: string; line2?: string; city: string; state: string; zip: string; country: string };
export type Shop = {
  id: string;
  name: string;
  owner: string;
  email?: string;
  approval: ShopApproval;
  address?: ShopAddress;
  founding: boolean;
};

export type ShopAccountMode = 'clear' | 'mock' | 'off';

export const AUDIENCE = 'useclear.org/shop';
export const SESSION_COOKIE = 'clear_shop';
export const STATE_COOKIE = 'clear_shop_state';
/* How long the site keeps a shop signed in after the hand-off. */
export const SESSION_SECONDS = 2 * 60 * 60;
const TOKEN_MAX_SECONDS = 15 * 60;

export function shopAccountMode(): ShopAccountMode {
  const m = process.env.SHOP_ACCOUNT;
  if (m === 'clear') return 'clear';
  if (m === 'mock') {
    if (process.env.VERCEL_ENV === 'production') {
      console.error('[shop/account] SHOP_ACCOUNT=mock is refused on production');
      return 'off';
    }
    return 'mock';
  }
  return 'off';
}

/* ── base64url and the compact JWS ───────────────────────────────────── */

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const unb64u = (s: string) => Buffer.from(s, 'base64url');

/* The mock's key pair, made once per server process. */
let mockKeys: { publicKey: KeyObject; privateKey: KeyObject } | null = null;
function mockKeyPair() {
  mockKeys ??= generateKeyPairSync('ed25519');
  return mockKeys;
}

function publicKey(): KeyObject | null {
  if (shopAccountMode() === 'mock') return mockKeyPair().publicKey;
  const pem = process.env.CLEAR_API_PUBLIC_KEY;
  if (!pem) return null;
  try {
    return createPublicKey(pem.replace(/\\n/g, '\n'));
  } catch (err) {
    console.error('[shop/account] CLEAR_API_PUBLIC_KEY does not parse', err);
    return null;
  }
}

type Claims = {
  aud?: string;
  sub?: string;
  name?: string;
  owner?: string;
  email?: string;
  approval?: string;
  address?: ShopAddress;
  founding?: boolean;
  state?: string;
  iat?: number;
  exp?: number;
};

const APPROVALS: readonly ShopApproval[] = ['pending', 'approved', 'declined'];

/* Verify a hand-off token: signature, audience, freshness and state. Returns
   the shop, or null for anything that does not check out. */
export function verifyToken(token: string, expectedState: string, now = Date.now() / 1000): Shop | null {
  const key = publicKey();
  if (!key || !token || !expectedState) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header: { alg?: string };
  let c: Claims;
  try {
    header = JSON.parse(unb64u(h).toString('utf8'));
    c = JSON.parse(unb64u(p).toString('utf8'));
  } catch {
    return null;
  }
  if (header.alg !== 'EdDSA') return null;
  if (!verify(null, Buffer.from(`${h}.${p}`), key, unb64u(s))) return null;
  if (c.aud !== AUDIENCE) return null;
  if (typeof c.iat !== 'number' || typeof c.exp !== 'number') return null;
  if (c.exp <= now || c.iat > now + 60 || c.exp - c.iat > TOKEN_MAX_SECONDS) return null;
  if (!safeEqual(c.state ?? '', expectedState)) return null;
  if (!c.sub || !c.name || !c.owner || !APPROVALS.includes(c.approval as ShopApproval)) return null;
  return {
    id: c.sub,
    name: c.name,
    owner: c.owner,
    email: c.email,
    approval: c.approval as ShopApproval,
    address: c.address,
    founding: c.founding === true,
  };
}

/* ── The mock's sample shop (the mockup's "Signed in") ───────────────── */

export const MOCK_SHOP: Shop = {
  id: 'mock-shop-micasa',
  name: 'Mi Casa Tacos',
  owner: 'Ana R.',
  email: 'ana@micasatacos.test',
  approval: 'pending',
  address: { line1: '1450 N Mountain Ave', city: 'Ontario', state: 'CA', zip: '91762', country: 'US' },
  founding: false,
};

/* Sign a hand-off token with the mock's key. Mock only. */
export function mockToken(state: string, shop: Shop = MOCK_SHOP, now = Math.floor(Date.now() / 1000)): string {
  if (shopAccountMode() !== 'mock') throw new Error('mockToken is for SHOP_ACCOUNT=mock');
  const header = b64u(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
  const claims: Claims = {
    aud: AUDIENCE,
    sub: shop.id,
    name: shop.name,
    owner: shop.owner,
    email: shop.email,
    approval: shop.approval,
    address: shop.address,
    founding: shop.founding,
    state,
    iat: now,
    exp: now + 10 * 60,
  };
  const payload = b64u(JSON.stringify(claims));
  const sig = sign(null, Buffer.from(`${header}.${payload}`), mockKeyPair().privateKey);
  return `${header}.${payload}.${b64u(sig)}`;
}

/* Where "Sign in to your shop" / "Set up a shop" go. */
export function connectUrl(returnTo: string, state: string, setup: boolean): string {
  const base = process.env.MERCHANT_CONNECT_URL || 'https://merchant.useclear.org/connect';
  const u = new URL(base);
  u.searchParams.set('return', returnTo);
  u.searchParams.set('state', state);
  if (setup) u.searchParams.set('setup', '1');
  return u.toString();
}

export const newState = () => randomBytes(18).toString('base64url');

/* ── The site's own session: the verified shop, HMAC-signed ──────────── */

let mockSecret: string | null = null;
function sessionSecret(): string | null {
  const s = process.env.SHOP_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (shopAccountMode() === 'mock') return (mockSecret ??= randomBytes(32).toString('hex'));
  return null;
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function sealSession(shop: Shop, now = Math.floor(Date.now() / 1000)): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const body = b64u(JSON.stringify({ shop, exp: now + SESSION_SECONDS }));
  const mac = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export function openSession(value: string | undefined, now = Math.floor(Date.now() / 1000)): Shop | null {
  if (shopAccountMode() === 'off' || !value) return null;
  const secret = sessionSecret();
  if (!secret) return null;
  const [body, mac] = value.split('.');
  if (!body || !mac) return null;
  if (!safeEqual(createHmac('sha256', secret).update(body).digest('base64url'), mac)) return null;
  try {
    const { shop, exp } = JSON.parse(unb64u(body).toString('utf8')) as { shop: Shop; exp: number };
    if (typeof exp !== 'number' || exp <= now || !shop?.id) return null;
    return shop;
  } catch {
    return null;
  }
}

/* ── Approval, for refunding the deposits of declined shops ──────────── */

/* 'unknown' whenever the API cannot say: the mock, a missing key, an error.
   Only a real 'declined' from the API ever leads to a refund. */
export async function shopApproval(shopId: string): Promise<ShopApproval | 'unknown'> {
  if (shopAccountMode() !== 'clear') return 'unknown';
  const api = process.env.CLEAR_API_URL;
  const key = process.env.SHOP_API_KEY;
  if (!api || !key) return 'unknown';
  try {
    const res = await fetch(`${api.replace(/\/$/, '')}/public/shops/${encodeURIComponent(shopId)}/approval`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    if (!res.ok) return 'unknown';
    const data = (await res.json()) as { status?: string };
    return APPROVALS.includes(data.status as ShopApproval) ? (data.status as ShopApproval) : 'unknown';
  } catch {
    return 'unknown';
  }
}
