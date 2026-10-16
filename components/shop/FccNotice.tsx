import { HARDWARE_COPY } from '@/content/shop';

/* The FCC notice on a product awaiting equipment authorization
   (preorder.fcc). Its words are the product's own, from the catalog. */
export function FccNotice({ text }: { text: string }) {
  return (
    <div className="fcc" role="note">
      <b>{HARDWARE_COPY.fcc}</b>
      <span>{text}</span>
    </div>
  );
}
