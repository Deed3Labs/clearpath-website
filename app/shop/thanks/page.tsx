import { Bento, Chip, More } from '@/components/system';
import { ClearBag } from '@/components/shop/ClearBag';
import { ThanksMotion } from '@/components/shop/ThanksMotion';
import { SUPPORT_EMAIL, THANKS } from '@/content/shop';

export const metadata = {
  title: 'Thank you · Shop',
  robots: { index: false },
};

/* Deliberately says nothing specific about the order. Anyone can open this
   URL, so it cannot be the confirmation; Stripe's receipt email is. That is
   the one place this page leaves the mockup: its receipt card and ship-to
   block are not ported, and the thank-you cell takes the full width, with
   the way back to the shop in its footer. */
export default function Thanks() {
  return (
    <div className="pg-shop">
      <ClearBag />
      <section className="wrap vsec">
        <Bento className="tbx">
          <div className="cell">
            <div className="c-h">
              <span className="who">{THANKS.who}</span>
              <Chip tone="live">{THANKS.chip}</Chip>
            </div>
            <div className="c-m">
              <h1 className="vh1">{THANKS.heading}</h1>
              <p className="tlede">{THANKS.lede}</p>
              <ThanksMotion>
                <ol className="tl">
                  {THANKS.steps.map((s) => (
                    <li key={s.b} data-s={s.done ? 'done' : undefined}>
                      <span className="bar" aria-hidden="true" />
                      <b>{s.b}</b>
                      <small>{s.s}</small>
                    </li>
                  ))}
                </ol>
              </ThanksMotion>
            </div>
            <div className="c-f">
              <span>
                {THANKS.questions}{' '}
                <a className="inl" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </span>
              <More href="/shop">{THANKS.back}</More>
            </div>
          </div>
        </Bento>
      </section>
    </div>
  );
}
