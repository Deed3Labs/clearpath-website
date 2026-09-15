import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Chip } from '@/components/primitives';
import { LiveDot } from '@/components/primitives/Button';
import { PROFILE, TAGS } from '@/content/directory';
import { getPartner, initials, listedPartners, mapsUrl, monthYear } from '@/lib/directory';

/* Only businesses this build lists get a page; a draft's URL 404s on the
   live site rather than showing a stand-in as a partner. */
export const dynamicParams = false;

export function generateStaticParams() {
  return listedPartners().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPartner((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} · Directory`,
    description: p.about ?? `${p.category} in ${p.city}. Takes Clear Pay.`,
  };
}

export default async function PartnerPage({ params }: Props) {
  const p = getPartner((await params).slug);
  if (!p) notFound();

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b>
          <Link href="/directory" className="shop-inline-link">
            {PROFILE.back}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{p.category}</span>
        </p>

        <div className="hx-grid ev-detail">
          <div className="c-two-thirds ev-body dir-profile">
            <div className="dir-profile-head">
              <span className="dir-avatar dir-avatar-lg" aria-hidden="true">
                {initials(p.name)}
              </span>
              <div>
                <h1 className="ev-detail-title">{p.name}</h1>
                <p className="hx-lede dir-profile-meta">
                  {p.category} · {p.city}
                </p>
              </div>
            </div>

            <div className="ev-chips">
              <Chip tone="live">{TAGS.pay}</Chip>
              {p.splitPlans && <Chip>{TAGS.split}</Chip>}
            </div>

            {p.about && <p className="t-body hx-prose">{p.about}</p>}
            {p.splitPlans && <p className="t-sm dir-split-note">{PROFILE.splitNote}</p>}
          </div>

          <aside className="c-third ev-ticket">
            <dl className="ev-facts">
              {p.address && (
                <div>
                  <dt>{PROFILE.address}</dt>
                  <dd>{p.address}</dd>
                </div>
              )}
              {p.hours && (
                <div>
                  <dt>{PROFILE.hours}</dt>
                  <dd>{p.hours}</dd>
                </div>
              )}
              {p.phone && (
                <div>
                  <dt>{PROFILE.phone}</dt>
                  <dd>
                    <a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`} className="shop-inline-link">
                      {p.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt>{PROFILE.accepts}</dt>
                <dd>{p.splitPlans ? `${TAGS.pay}, ${TAGS.split.toLowerCase()}` : TAGS.pay}</dd>
              </div>
              {p.partnerSince && (
                <div>
                  <dt>{PROFILE.since}</dt>
                  <dd>{monthYear(p.partnerSince)}</dd>
                </div>
              )}
            </dl>

            {p.address && (
              <a href={mapsUrl(p.address)} className="btn ev-cta" data-variant="primary" target="_blank" rel="noopener noreferrer">
                <LiveDot />
                {PROFILE.directions}
              </a>
            )}
            {p.website && (
              <a href={p.website} className="btn ev-cta" data-variant="ghost" target="_blank" rel="noopener noreferrer">
                {PROFILE.visit}
              </a>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
