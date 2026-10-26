import type { Product } from '@/content/shop';

/* A product for Command's import: everything an owner changes, without how
   the site draws it (the plate's tone and art, the renders and CAD sheets),
   which stays here, matched by slug. */
export function full(p: Product): Omit<Product, 'tone' | 'plate' | 'media'> {
  const out: Partial<Product> = { ...p, alsoIn: p.alsoIn ?? [], colours: p.colours ?? [] };
  delete out.tone;
  delete out.plate;
  delete out.media;
  return out as Omit<Product, 'tone' | 'plate' | 'media'>;
}
