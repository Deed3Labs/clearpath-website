import { Qr } from '@/components/system';
import { ONLINE } from '@/content/shopsTools';

/* No website: a payment link, and the code that opens it. The code is a
   picture of one, never something to scan. */

export function LinkCell() {
  const l = ONLINE.integration.link;
  return (
    <div className="c-f lnkf">
      <div className="lnk">
        <div>
          <b>{l.title}</b>
          <p className="url">{l.url}</p>
          <p className="note">{l.note}</p>
        </div>
        <span className="qrw">
          <Qr seed={11} />
        </span>
      </div>
    </div>
  );
}
