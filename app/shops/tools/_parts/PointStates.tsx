import Image from 'next/image';
import { TABLES } from '@/content/shopsTools';

/* The Point on the table, in its four states: renders of the real device
   showing its real screens, one 5:4 frame each. The caption says what each
   screen says. */

export function PointStates() {
  return (
    <div className="pts4">
      {TABLES.points.map((p) => (
        <div key={p.k}>
          <div className="rnd">
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 50vw, 25vw" />
          </div>
          <div className="cap">
            <span>{p.k}</span>
            <span>{p.v}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
