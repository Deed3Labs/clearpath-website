import { PageHero, Section, SectionHead } from '@/components/system';
import { BoardIntro } from '@/components/events/Motion';
import { DirectoryBoard } from '@/components/directory/DirectoryBoard';
import { ReferForm } from '@/components/directory/ReferForm';
import { WhyArt } from '@/components/directory/WhyArt';
import { int } from '@/lib/format';
import { EMPTY, FACTS, META, OPENING, WHY } from '@/content/directory';
import { listedPartners } from '@/lib/directory';
import './page.css';

export const metadata = { title: META.title, description: META.description };

/* The directory, ported from reference/redesign/directory.html: the public
 * side of the app's Clear Partners list.
 *
 * With partners it is a list you search beside a drawn map of the Inland
 * Empire, the two linked. Without any it is not a dead page: it says the
 * first partners are signing on, points a shop owner at /shops, and the map
 * shows the towns with no pins. 01 asks members for the businesses they
 * already use, which is how most partners arrive; 02, on ink, is why it
 * matters. Drafts never reach the live site (lib/directory.ts).
 */
export default function Directory() {
  const partners = listedPartners();
  const n = [partners.length, new Set(partners.map((p) => p.city)).size, partners.filter((p) => p.splitPlans).length];

  return (
    <div className="pg-directory">
      <PageHero
        label={OPENING.label}
        lines={OPENING.lines}
        size="min(7.6vw, 104px)"
        phoneSize="clamp(40px, 11.6vw, 60px)"
        phone="wrap"
        className="dhero"
        lede={OPENING.lede}
        side={
          <ul className="facts" data-in>
            {partners.length
              ? FACTS.listed.map((f, i) => (
                  <li key={f.k}>
                    <span>{f.k}</span>
                    <span>
                      <b>{int(n[i])}</b> {f.after}
                    </span>
                  </li>
                ))
              : FACTS.empty.map((f) => (
                  <li key={f.k}>
                    <span>{f.k}</span>
                    <span>{f.v}</span>
                  </li>
                ))}
          </ul>
        }
      >
        <BoardIntro bar="#dir .dbar" board="#dir .dboard" rows="#dir .prow" />
      </PageHero>

      <section className="wrap dir" id="dir">
        <DirectoryBoard partners={partners} />
      </section>

      <Section id="refer">
        <SectionHead n={EMPTY.referN} label={EMPTY.referLabel} title={EMPTY.referHeading} line={EMPTY.referLede} />
        <div className="body-gap">
          <ReferForm />
        </div>
      </Section>

      <Section ink id="why">
        <SectionHead n={WHY.n} label={WHY.label} title={WHY.title} line={WHY.line} />
        <WhyArt />
      </Section>
    </div>
  );
}
