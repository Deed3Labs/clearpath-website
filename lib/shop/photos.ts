import { del, put } from '@vercel/blob';

/* Product photos in Vercel Blob (the Command Center's Phase 11d): the store
   clear-shop-photos, public, connected to this project (BLOB_READ_WRITE_TOKEN).
   Each product's photos sit under shop/<its id>/. */

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/* Where a photo goes: shop/<product>/<its name, cleaned>.<type>, or null for
   a product id that isn't one (lowercase letters and numbers). Blob adds a
   random suffix, so two photos with one name both keep theirs. */
export function photoPath(product: string, name: string, type: string): string | null {
  if (!/^[a-z0-9]{1,64}$/.test(product) || !PHOTO_TYPES[type]) return null;
  const base =
    name
      .replace(/\.[a-z0-9]+$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'photo';
  return `shop/${product}/${base}.${PHOTO_TYPES[type]}`;
}

/* Whether an address is a photo stored here: this store's public host, under shop/. */
export function isOurPhoto(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /^[a-z0-9]+\.public\.blob\.vercel-storage\.com$/.test(u.hostname) && u.pathname.startsWith('/shop/');
  } catch {
    return false;
  }
}

export async function storePhoto(path: string, bytes: Uint8Array, type: string, store: { put: typeof put } = { put }): Promise<string> {
  const b = await store.put(path, Buffer.from(bytes), { access: 'public', contentType: type, addRandomSuffix: true, cacheControlMaxAge: 31536000 });
  return b.url;
}

export async function removePhoto(url: string, store: { del: typeof del } = { del }): Promise<boolean> {
  if (!isOurPhoto(url)) return false;
  await store.del(url);
  return true;
}
