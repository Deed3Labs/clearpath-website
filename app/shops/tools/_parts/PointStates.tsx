import { ProductPlate } from '@/components/shop/ProductPlate';
import { PlateDraw } from '@/components/shop/PlateDraw';
import { TABLES } from '@/content/shopsTools';

/* The Point on the table, in its four states, drawn as the shop draws its
   hardware (the plate system's line drawings of the real screens). They
   draw themselves in once as they come into view; the server markup is the
   finished drawing. The caption says what each screen says. */

export function PointStates() {
  return (
    <PlateDraw className="pts4">
      {TABLES.points.map((p) => (
        <div key={p.k}>
          <ProductPlate drawing={p.drawing} tone="paper" />
          <div className="cap">
            <span>{p.k}</span>
            <span>{p.v}</span>
          </div>
        </div>
      ))}
    </PlateDraw>
  );
}
