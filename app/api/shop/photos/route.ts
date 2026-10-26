import { NextResponse } from 'next/server';
import { isCommand } from '@/lib/shop/commandToken';
import { photoPath, removePhoto, storePhoto, PHOTO_TYPES, MAX_PHOTO_BYTES } from '@/lib/shop/photos';

export const runtime = 'nodejs';

/* Product photos (the Command Center's Phase 11d): Command uploads a photo
   here and keeps the address it gets back in the product's catalog record;
   the shop shows it from Vercel Blob. Only with COMMAND_CATALOG_TOKEN.

     POST   ?product=<id>&name=<file name>, the image as the body (JPEG,
            PNG or WebP, up to 4 MB): stored under shop/<id>/, its address
            returned.
     DELETE { url }: a photo stored here goes. Nothing outside shop/ in this
            site's store can be named. */
const no = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function POST(request: Request) {
  if (!isCommand(request.headers.get('authorization'))) return no('Not allowed', 401);
  const q = new URL(request.url).searchParams;
  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!PHOTO_TYPES[type]) return no('A photo is a JPEG, PNG or WebP', 415);
  const path = photoPath(q.get('product') ?? '', q.get('name') ?? '', type);
  if (!path) return no('Name the product', 400);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (!bytes.length) return no('That photo is empty', 400);
  if (bytes.length > MAX_PHOTO_BYTES) return no('A photo can be up to 4 MB', 413);
  const url = await storePhoto(path, bytes, type);
  return NextResponse.json({ url }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function DELETE(request: Request) {
  if (!isCommand(request.headers.get('authorization'))) return no('Not allowed', 401);
  const url = String(((await request.json().catch(() => ({}))) as { url?: unknown }).url ?? '');
  if (!(await removePhoto(url))) return no('Not a photo stored here', 400);
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
