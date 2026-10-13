import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Chip, CrumbLink, Crumbbar, LiveDot, Ticket, type TicketFact } from '@/components/system';
import { RiseIn } from '@/components/events/Motion';
import { Avatar } from '@/components/directory/Avatar';
import { cropAround, MapArt, onMap } from '@/components/directory/MapArt';
import { PinDrop } from '@/components/directory/PinDrop';
import { PartnerRow } from '@/components/directory/PartnerRow';
import { PROFILE, TAGS, TOWNS } from '@/content/directory';
import { getPartner, listedPartners, mapsUrl, monthYear } from '@/lib/directory';
import '../page.css';

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

/* A partner's page, ported from the mockup's partner view: the crumb bar,
   the body cell (who they are, the Clear Pay chip, a small map of the town),
   a ticket beside it (how to visit), then the three nearest partners. */
export default async function PartnerPage({ params }: Props) {
  const p = getPartner((await params).slug);
  if (!p) notFound();

  const tel = p.phone?.replace(/[^\d+]/g, '');
  const facts: TicketFact[] = [
    ...(p.address ? [{ k: PROFILE.address, v: p.address }] : []),
    ...(p.hours ? [{ k: PROFILE.hours, v: p.hours }] : []),
    ...(p.phone
      ? [
          {
            k: PROFILE.phone,
            v: (
              <a className="inl" href={`tel:${tel}`}>
                {p.phone}
              </a>
            ),
          },
        ]
      : []),
    { k: PROFILE.accepts, v: p.splitPlans ? PROFILE.acceptsSplit : TAGS.pay },
    ...(p.partnerSince ? [{ k: PROFILE.since, v: monthYear(p.partnerSince) }] : []),
  ];

  /* Nearest first, by the distance between towns on the map. A partner in a
     town the map does not have yet sorts last. */
  const here = TOWNS[p.city];
  const dist = (c: string) => (here && TOWNS[c] ? Math.hypot(TOWNS[c].x - here.x, TOWNS[c].y - here.y) : Infinity);
  const near = listedPartners()
    .filter((q) => q.slug !== p.slug)
    .sort((a, b) => dist(a.city) - dist(b.city))
    .slice(0, 3);

  return (
    <div className="pg-directory">
      <Crumbbar
        crumbs={[{ href: '/directory', label: PROFILE.crumb }, { label: p.category }]}
        action={<CrumbLink href="/directory">{PROFILE.all}</CrumbLink>}
      />
      <section className="wrap vsec">
        <RiseIn className="pp2" gate sel=":scope > .body > *, :scope > .tk > *" y={12} duration={0.5} stagger={0.05}>
          <div className="cell body">
            <div className="phd">
              <Avatar category={p.category} name={p.name} />
              <div>
                <h1>{p.name}</h1>
                <p className="lede">
                  {p.category} · {p.city}
                </p>
              </div>
            </div>
            <div className="chips">
              <Chip tone="live">{TAGS.pay}</Chip>
              {p.splitPlans && <Chip>{TAGS.split}</Chip>}
            </div>
            {p.about && <p className="copy">{p.about}</p>}
            {p.splitPlans && <p className="note2">{PROFILE.splitNote}</p>}
            {onMap(p) && (
              <figure className="pmap">
                <PinDrop className="mapw">
                  <MapArt partners={[p]} crop={cropAround(p.city)} small hot={p.slug} />
                </PinDrop>
                <figcaption>
                  <span>{p.city}</span>
                  <span>{PROFILE.mapCaption}</span>
                </figcaption>
              </figure>
            )}
          </div>

          <Ticket who={PROFILE.visit} ck={p.city} facts={facts}>
            {p.address && (
              <a className="btn" data-variant="primary" href={mapsUrl(p.address)} target="_blank" rel="noopener noreferrer">
                <LiveDot />
                {PROFILE.directions}
              </a>
            )}
            {p.website && (
              <a className="btn" data-variant="ghost" href={p.website} target="_blank" rel="noopener noreferrer">
                {PROFILE.website}
              </a>
            )}
            {!p.address && !p.website && p.phone && (
              <a className="btn" data-variant="primary" href={`tel:${tel}`}>
                <LiveDot />
                {PROFILE.call(p.phone)}
              </a>
            )}
          </Ticket>
        </RiseIn>

        {near.length > 0 && (
          <div className="near">
            <div className="sec-label label">
              <b>{PROFILE.near.n}</b>
              {PROFILE.near.label}
            </div>
            <div className="bxn">
              {near.map((q) => (
                <PartnerRow p={q} key={q.slug} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
