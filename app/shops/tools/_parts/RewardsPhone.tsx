import Image from 'next/image';
import { REWARDS } from '@/content/shopsTools';

/* The shop's rewards app on her phone: a picture of the real screen. */

export function RewardsPhone() {
  const p = REWARDS.phone;
  return (
    <div className="cell rwcell">
      <div className="c-h">
        <span className="who">{p.who}</span>
        <span className="url">{p.url}</span>
      </div>
      <div className="c-m">
        <Image className="rwimg" src={p.src} alt={p.alt} width={600} height={1738} sizes="300px" />
      </div>
    </div>
  );
}
