import { DirectoryList } from '@/components/directory/DirectoryList';
import { ReferForm } from '@/components/directory/ReferForm';
import { Button } from '@/components/primitives/Button';
import { EMPTY, OPENING, WHY } from '@/content/directory';
import { listedPartners } from '@/lib/directory';

export const metadata = {
  title: 'Directory',
  description: 'Local businesses in the Inland Empire that take Clear Pay.',
};

/* The public side of the app's Clear Partners list.
 *
 * With partners it is a list you search: name, kind of business and city,
 * with a tag for Clear Pay and one for split plans. Without any it is not a
 * dead page — it says the first partners are signing on, points a shop owner
 * at /shops, and asks members for the businesses they already use, which is
 * how most partners arrive. The referral form is on the page either way.
 */
export default function Directory() {
  const partners = listedPartners();

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b> {OPENING.kicker}
        </p>
        <div className="hx-grid">
          <h1 className="hx-h2 c-two-thirds">{OPENING.heading}</h1>
          <p className="hx-lede c-third dir-lede">{OPENING.lede}</p>

          <div className="c-full">
            {partners.length ? (
              <DirectoryList partners={partners} />
            ) : (
              <div className="dir-empty">
                <p className="dir-empty-h">{EMPTY.heading}</p>
                <p className="t-sm dir-empty-lede">{EMPTY.lede}</p>
                <Button href="/shops" live>
                  {EMPTY.shopButton}
                </Button>
              </div>
            )}
          </div>

          <div className="c-full dir-refer-band" id="refer">
            <div className="dir-refer-copy">
              <h2 className="dir-refer-h">{EMPTY.referHeading}</h2>
              <p className="t-sm dir-refer-lede">{EMPTY.referLede}</p>
            </div>
            <ReferForm />
          </div>
        </div>
      </section>

      <section className="hx-band" data-tone="ink">
        <div className="hx-wrap">
          <p className="hx-label">
            <b>02</b> {WHY.kicker}
          </p>
          <div className="hx-cols dir-why" data-n="3" data-rows="3">
            {WHY.sides.map((s) => (
              <div className="side" key={s.label}>
                <p className="side-label">{s.label}</p>
                <p className="side-line">{s.line}</p>
                <p className="t-sm side-note">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
