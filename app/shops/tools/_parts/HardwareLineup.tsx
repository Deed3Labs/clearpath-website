import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, type Product } from '@/content/shop';
import { getProduct, fromLabel, fromDeposit } from '@/lib/shop/catalog';
import { usd } from '@/lib/shop/money';
import { HARDWARE } from '@/content/shopsTools';
import { Rise } from './Rise';

/* Five pieces of hardware, straight from the catalog: the first render, the
   price ("From" when the options differ) and the deposit. A tile links to
   its product page only when the shop shows that product (drafts 404), so
   on a default build the tiles are not links. The render is decorative: the
   name sits under it. */

const lineup = HARDWARE.lineup
  .map((slug) => PRODUCTS.find((p) => p.slug === slug))
  .filter((p): p is Product => Boolean(p));

function Tile({ p }: { p: Product }) {
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
  return getProduct(p.slug) ? (
    <Link className="cell" href={`/shop/${p.slug}`}>
      {body}
    </Link>
  ) : (
    <div className="cell">{body}</div>
  );
}

export function HardwareLineup() {
  return (
    <Rise className="bx c5 body-gap">
      {lineup.map((p) => (
        <Tile key={p.slug} p={p} />
      ))}
    </Rise>
  );
}
