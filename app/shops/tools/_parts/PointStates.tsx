import Image from 'next/image';
import { TABLES } from '@/content/shopsTools';
import { Rise } from './Rise';

/* The Point on the table, in its four states. The caption says what each
   screen says, so the pictures themselves are decorative. */

export function PointStates() {
  return (
    <Rise className="pts4">
      {TABLES.points.map((p) => (
        <div key={p.k}>
          <div className="eink">
            <Image src={p.src} alt="" width={1200} height={900} sizes="(max-width: 860px) 45vw, 300px" />
          </div>
          <div className="cap">
            <span>{p.k}</span>
            <span>{p.v}</span>
          </div>
        </div>
      ))}
    </Rise>
  );
}
