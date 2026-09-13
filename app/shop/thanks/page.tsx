import Link from 'next/link';
import { ClearBag } from '@/components/shop/ClearBag';
import { SUPPORT_EMAIL, THANKS } from '@/content/shop';

export const metadata = {
  title: 'Thank you · Shop',
  robots: { index: false },
};

/* Deliberately says nothing specific about the order. Anyone can open this
   URL, so it cannot be the confirmation; Stripe's receipt email is. */
export default function Thanks() {
  return (
    <div className="hx">
      <ClearBag />
      <section className="hx-band hx-wrap" data-pad="tight">
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{THANKS.heading}</h1>
          <div className="c-third shop-soon-side">
            <p className="hx-lede">{THANKS.lede}</p>
            <p className="t-sm shop-thanks-help">
              {THANKS.questions}{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="shop-inline-link">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <Link href="/shop" className="btn" data-variant="ghost">
              {THANKS.back}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
