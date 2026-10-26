import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/content/shop';
import { getProduct, fromLabel, fromDeposit } from '@/lib/shop/catalog';
import { shopCatalog } from '@/lib/shop/source';
import { usd } from '@/lib/shop/money';
import { HARDWARE } from '@/content/shopsTools';
import { Rise } from './Rise';

/* Five pieces of hardware, straight from the catalog: the first render, the
   price ("From" when the options differ) and the deposit. A tile links to
   its product page only when the shop shows that product (drafts 404), so
   on a default build the tiles are not links. The render is decorative: the
   name sits under it. */

function Tile({ p, all }: { p: Product; all: Product[] }) {
  const render = p.media?.find((m) => m.kind === 'render');
  const body = (
    <>
      <div className="plate">
        {render && <Image src={render.src} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 256px" />}
      </div>
      <div className="pf2">
        <b>{p.name}</b>
        <span className="fig">{fromLabel(p)}</span>
        <small>
          {HARDWARE.reserve} {usd(fromDeposit(p))}
        </small>
      </div>
    </>
  );
  return getProduct(p.slug, all) ? (
    <Link className="cell" href={`/shop/${p.slug}`}>
      {body}
    </Link>
  ) : (
    <div className="cell">{body}</div>
  );
}

export async function HardwareLineup() {
  /* the catalog's, so a price changed in the Command Center shows here too */
  const all = await shopCatalog();
  const lineup = HARDWARE.lineup.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p));
  return (
    <Rise className="bx c5 body-gap">
      {lineup.map((p) => (
        <Tile key={p.slug} p={p} all={all} />
      ))}
    </Rise>
  );
}
