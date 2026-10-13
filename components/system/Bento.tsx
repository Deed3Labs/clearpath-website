import type { CSSProperties, ElementType, ReactNode } from 'react';

/* Draw rules, not boxes. A bento is one ruled grid sitting flat on the page:
   one line weight (--line), padding on the rows (--px) so every internal rule
   runs wall to wall, and stacked bentos share a seam. A cell is header / main
   / footer.

   `cols` gives equal columns with a seam between cells; `rows` makes every
   cell borrow the bento's rows through subgrid, so headers, headlines and
   figures land on the same lines across columns; `stack` is the width at
   which the columns stack, the seams turn horizontal and subgrid lets go.
   Unequal columns are a page's own grid-template-columns. */

type Stack = 560 | 680 | 760 | 860 | 900 | 980;

export function Bento({
  as: Tag = 'div',
  className,
  id,
  cols,
  rows,
  stack,
  style,
  label,
  children,
}: {
  as?: ElementType;
  className?: string;
  id?: string;
  cols?: 2 | 3 | 4;
  rows?: number;
  stack?: Stack;
  style?: CSSProperties;
  /* An accessible name, for a bento that is one figure. */
  label?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={['bx', className].filter(Boolean).join(' ')}
      data-cols={cols}
      data-rows={rows}
      data-stack={stack}
      style={rows ? ({ '--rows': rows, ...style } as CSSProperties) : style}
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

export function Cell({
  as: Tag = 'div',
  head,
  foot,
  className,
  headClass,
  mainClass,
  footClass,
  id,
  style,
  children,
}: {
  as?: ElementType;
  head?: ReactNode;
  foot?: ReactNode;
  className?: string;
  headClass?: string;
  mainClass?: string;
  footClass?: string;
  id?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <Tag id={id} className={['cell', className].filter(Boolean).join(' ')} style={style}>
      {head !== undefined && <div className={['c-h', headClass].filter(Boolean).join(' ')}>{head}</div>}
      {children !== undefined && <div className={['c-m', mainClass].filter(Boolean).join(' ')}>{children}</div>}
      {foot !== undefined && <div className={['c-f', footClass].filter(Boolean).join(' ')}>{foot}</div>}
    </Tag>
  );
}

/* A tabular figure in the text face. Magnitude is never set in mono. */
export function Fig({
  as: Tag = 'span',
  live,
  className,
  id,
  children,
}: {
  as?: ElementType;
  live?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} className={['fig', live && 'live', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}

/* A knob on a rail, centred in its column. Decorative: the column's own text
   says where it is in the sequence. */
export function Knob({ live, className }: { live?: boolean; className?: string }) {
  return <span className={['knob', live && 'live', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
