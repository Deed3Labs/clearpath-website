import { PageHero } from '@/components/system';
import { JoinForm } from '@/components/interactive/JoinForm';
import { META, HERO, MODES, type ModeKey } from '@/content/join';
import './page.css';

export const metadata = { title: META.title, description: META.description };

/* Join, ported from reference/redesign/join.html: the hero and the form are
 * one composition, nothing to scroll past to reach the thing the page is for.
 *
 * `?as=member|shop|land|work` picks the starting answer. It is read here, on
 * the server, rather than with useSearchParams in the form: that would put
 * the form behind a Suspense boundary and ship it as an empty fallback, so a
 * reader without JavaScript would get no form at all and a deep link would
 * flash the member fields first. Reading it here renders the page per
 * request, with the right fields in the HTML.
 *
 * The form submits for real; see JoinForm. Set NEXT_PUBLIC_JOIN_ENDPOINT and
 * it ships. */

const isMode = (v: unknown): v is ModeKey => typeof v === 'string' && MODES.some((m) => m.key === v);

export default async function Join({ searchParams }: { searchParams: Promise<{ as?: string | string[] }> }) {
  const { as } = await searchParams;
  const mode = isMode(as) ? as : 'member';
  return (
    <div className="pg-join">
      <PageHero
        label={HERO.label}
        lines={HERO.lines}
        size="min(7.8vw, 108px)"
        phoneSize="clamp(44px, 13vw, 72px)"
        phone="block"
        lede={HERO.lede}
        facts={HERO.facts}
        figs
      >
        <JoinForm initialMode={mode} />
      </PageHero>
    </div>
  );
}
