import Link from 'next/link';
import { DateBlock, HeroWords, LiveDot, Section, SectionHead } from '@/components/system';
import { HeroScope } from '@/components/system/HeroScope';
import { NotifyForm } from '@/components/interactive/NotifyForm';
import { Board, BoardState, SeeThem, type BoardRow } from '@/components/events/Board';
import { Countdown } from '@/components/events/Countdown';
import { CalAdd, EventChips, EventRowBody } from '@/components/events/EventRow';
import { KindIcon } from '@/components/events/KindIcon';
import { BoardIntro, RiseIn } from '@/components/events/Motion';
import { dayKey, FORMAT, isLocal, localCalendars, monthName, shortDate, timeLabel, whereShort, type MonthName } from '@/components/events/model';
import { Arrow } from '@/components/system/icons';
import { EMPTY, KINDS, LISTING, META, NEXT, OPENING } from '@/content/events';
import { allEvents, isUpcoming, type CalEvent } from '@/lib/events/sources';
import { monthKey, timeRange } from '@/lib/events/time';
import './page.css';

export const metadata = { title: META.title, description: META.description };

/* Five minutes, to match Clear's feeds (see CLEAR_FEED_REVALIDATE_SECONDS).
   City calendars inside are still fetched hourly: each fetch keeps its own
   cache, so re-rendering sooner does not ask their servers more often. */
export const revalidate = 300;

/* Events, ported from reference/redesign/events.html.
 *
 * A calendar, not a feature page. The hero says what is next and counts down
 * to it. The board under it is the content: a month on the left (a strip of
 * days on a phone) and the agenda on the right, in two sections because they
 * are two kinds of thing: Clear's events, which you register for, and the
 * public meetings next door, which you just turn up to. With no Clear event
 * posted, that section keeps its header and takes an email. 02, on ink, is
 * the four kinds of meeting, each a way into the board.
 *
 * Every date is formatted here on the server by lib/events/time.ts; the
 * board in the browser only compares day keys. */

/* The next Clear event, or with none posted the next public meeting. */
function NextUp({ e }: { e: CalEvent }) {
  const local = isLocal(e);
  const where = whereShort(e);
  const starts = `${NEXT.starts} ${shortDate(e.start)}${e.timeUnknown ? '' : ` · ${timeRange(e.start)}`}`;
  return (
    <div className="next" data-in>
      <div className="c-h">
        <span className="who">{NEXT.who}</span>
        <span className="chips">{local ? <span className="chip k">{NEXT.localChip}</span> : <EventChips event={e} />}</span>
      </div>
      <Link className="nm" href={`/events/${e.slug}`} prefetch={local ? false : undefined}>
        <DateBlock date={e.start} />
        <span className="nt">
          {e.title}
          <small>
            {timeLabel(e)}
            {where && ` · ${where}`}
          </small>
        </span>
      </Link>
      <Countdown at={e.start.toISOString()} label={NEXT.startsIn} units={NEXT.units} fallback={starts} />
      <div className="c-f">
        {local ? (
          <>
            <span className="ck">{NEXT.open}</span>
            {e.officialUrl && (
              <a className="btn" data-variant="ghost" href={e.officialUrl} target="_blank" rel="noopener noreferrer">
                {NEXT.agenda}
              </a>
            )}
          </>
        ) : (
          <>
            <span className="ck">
              {e.price ?? LISTING.free} · {FORMAT[e.format]}
            </span>
            {e.registerUrl ? (
              <a className="btn" data-variant="primary" href={e.registerUrl} target="_blank" rel="noopener noreferrer">
                <LiveDot />
                {NEXT.register}
              </a>
            ) : (
              <span className="ck">{NEXT.noRegister}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* The Clear section with nothing posted: it keeps its header, says so, and
   takes an email (NotifyForm: success only after a 2xx). */
function ClearEmpty() {
  return (
    <div className="empty1">
      <div>
        <h3>{EMPTY.heading}</h3>
        <p>{EMPTY.lede}</p>
      </div>
      <NotifyForm as="events" id="notify-events" copy={EMPTY.notify} />
    </div>
  );
}

export default async function Events() {
  const now = new Date();
  const upcoming = (await allEvents()).filter((e) => isUpcoming(e, now));

  const months: Record<string, MonthName> = { [monthKey(now)]: monthName(now) };
  for (const e of upcoming) months[monthKey(e.start)] ??= monthName(e.start);

  const rows: BoardRow[] = upcoming.map((e) => ({
    slug: e.slug,
    day: dayKey(e.start),
    month: monthKey(e.start),
    groups: e.groups,
    local: isLocal(e),
    node: <EventRowBody event={e} />,
  }));

  /* Next means not started yet: a meeting already under way would count
     down from zero. */
  const live = upcoming.filter((e) => !e.cancelled && e.start > now);
  const next = live.find((e) => !isLocal(e)) ?? live[0];

  const count = (g: string) => upcoming.filter((e) => (e.groups as string[]).includes(g)).length;

  return (
    <div className="pg-events">
      <HeroScope className="hero evhero wrap" style={{ '--h1': 'min(7.6vw, 104px)', '--h1-phone': 'clamp(40px, 11.6vw, 60px)' } as React.CSSProperties}>
        <div className="page-label label">
          <b>{OPENING.label.kicker}</b>
          {OPENING.label.title}
        </div>
        <div className="hero-row">
          <div className="evl">
            <h1 className="hero-h1" data-phone="wrap">
              <HeroWords lines={OPENING.lines} />
            </h1>
            <div data-in>
              <p className="hero-lede">{OPENING.lede}</p>
              <a className="sub-link" href="/events/calendar.ics">
                <CalAdd />
                {OPENING.subscribe}
              </a>
            </div>
          </div>
          {next && <NextUp e={next} />}
        </div>
        <BoardIntro bar="#cal .evbar" board="#cal .board" rows="#cal .agenda .row" />
      </HeroScope>

      <BoardState>
        <section className="wrap cal" id="cal">
          <Board
            rows={rows}
            months={months}
            today={dayKey(now)}
            todayLabel={shortDate(now)}
            calendars={localCalendars()}
            clearEmpty={<ClearEmpty />}
          />
        </section>

        <Section ink id="kinds">
          <SectionHead n={KINDS.n} label={KINDS.label} title={KINDS.title} line={KINDS.line} />
          <RiseIn className="kinds body-gap">
            {KINDS.sides.map((k) => {
              const n = count(k.group);
              return (
                <div className="cell" key={k.group}>
                  <div className="c-h">
                    <span className="who">{k.label}</span>
                    <span className="ck">{n ? KINDS.upcoming(n) : KINDS.none}</span>
                  </div>
                  <div className="c-m">
                    <KindIcon group={k.group} />
                    <h3>{k.line}</h3>
                    <p>{k.note}</p>
                  </div>
                  <div className="c-f">
                    {n ? (
                      <SeeThem group={k.group}>
                        {KINDS.see}
                        <Arrow />
                      </SeeThem>
                    ) : (
                      <span className="ck">{KINDS.nothing}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </RiseIn>
        </Section>
      </BoardState>
    </div>
  );
}
