import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { isCommand } from '@/lib/shop/commandToken';
import { CATALOG_TAG } from '@/lib/shop/source';

export const runtime = 'nodejs';

/* The Command Center says the catalog changed (its Phase 11b): the cached
   catalog and the shop's pages are read again on their next visit, so an
   edit shows within seconds rather than at the cache's next minute. Only
   with COMMAND_CATALOG_TOKEN; it changes nothing but what's cached. */
export async function POST(request: Request) {
  if (!isCommand(request.headers.get('authorization'))) return NextResponse.json({ error: 'Not allowed' }, { status: 401 });
  revalidateTag(CATALOG_TAG);
  revalidatePath('/shop', 'layout');
  revalidatePath('/shops', 'layout');
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
