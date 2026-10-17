import Image from 'next/image';
import { More, Section, SectionHead } from '@/components/system';
import { BEYOND } from '@/content/shops';
import { PRODUCTS } from '@/content/shop';
import { forShopsProducts, isShopOpen } from '@/lib/shop/catalog';
import { fromLabel } from '@/lib/shop/price';

/* 04 Beyond financing: for the shops financing does not suit, the rest of
   the app in four cells, each with its picture, then a line about the
   hardware. Two are renders of the hardware (the counter on the till, a
   table Point showing the bill); the other two are real screens. Static:
   the section is a pointer to /shops/tools, not a demo. */

type Cell = (typeof BEYOND.cells)[number];

function value(v: Cell['v']) {
  if (typeof v === 'string') return v;
  const p = PRODUCTS.find((x) => x.slug === v.fromPrice);
  return p ? fromLabel(p) : '';
}

function Pic({ pic }: { pic: Cell['pic'] }) {
  if (pic.kind === 'render') {
    return (
      <div className="vis r">
        <Image src={pic.src} alt={pic.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 340px" />
      </div>
    );
  }
  return (
    <div className={pic.frame === 'modal' ? 'vis s m' : 'vis s'}>
      <Image src={pic.src} alt={pic.alt} width={pic.w} height={pic.h} sizes="(max-width: 640px) 70vw, (max-width: 1100px) 34vw, 240px" />
    </div>
  );
}

export function Beyond() {
  /* The hardware line goes to the shop once any hardware is for sale there,
     and to the hardware on /shops/tools until then (drafts 404). */
  const forSale = isShopOpen() && forShopsProducts().length > 0;
  const hw = BEYOND.hardware;
  return (
    <Section id="beyond">
      <SectionHead n={BEYOND.n} label={BEYOND.label} title={BEYOND.title} line={BEYOND.line} more={BEYOND.more} />
      <div className="bx by4 body-gap">
        {BEYOND.cells.map((c) => (
          <div className="cell" key={c.who}>
            <div className="c-h">
              <span className="who">{c.who}</span>
            </div>
            <Pic pic={c.pic} />
            <div className="c-m">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
            <div className="c-f">
              <span className="ck">{c.k}</span>
              <span className="fig">{value(c.v)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bx by-f">
        <div className="cell">
          <div className="c-f">
            <span>{hw.text}</span>
            <More href={forSale ? hw.more.shop : hw.more.tools}>{hw.more.label}</More>
          </div>
        </div>
      </div>
    </Section>
  );
}
