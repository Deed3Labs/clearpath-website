'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/* An event page throws when the calendar it comes from could not be reached
   (see getEvent). That is a moment, not a missing meeting, so the page says
   so and offers a retry. Errors are not cached, so the next visit tries the
   calendar again rather than serving a stored 404. */
export default function EventError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[events] event page failed', error.message);
  }, [error]);

  return (
    <div className="hx">
      <section className="hx-band hx-wrap" data-pad="tight">
        <p className="hx-label">
          <b>01</b>
          <Link href="/events" className="shop-inline-link">
            Events
          </Link>
        </p>
        <div className="hx-grid">
          <div className="c-two-thirds ev-body">
            <h1 className="ev-detail-title">We could not reach this calendar.</h1>
            <p className="hx-lede">
              The city or county site that lists this meeting did not answer in time. It usually does on a second try.
            </p>
            <div className="ev-error-actions">
              <button type="button" className="btn" data-variant="primary" onClick={reset}>
                Try again
              </button>
              <Link href="/events" className="btn" data-variant="ghost">
                Back to events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
