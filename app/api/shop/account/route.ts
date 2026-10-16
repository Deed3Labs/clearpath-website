import { NextResponse } from 'next/server';
import { currentShop } from '@/lib/shop/currentShop';
import { shopAccountMode } from '@/lib/shop/shopAccount';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* What the bag shows in its Your shop step. The session cookie is httpOnly,
   so the page asks here. Only what the bag displays leaves the server. */
export async function GET() {
  const mode = shopAccountMode();
  const shop = await currentShop();
  return NextResponse.json(
    {
      mode,
      shop: shop && { name: shop.name, owner: shop.owner, email: shop.email, address: shop.address, approval: shop.approval },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
