import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from './icons';

/* One field: the input and its button share a single pill, so their tops and
   bottoms are the same line. Phones stack them as two pills. Presentational
   only — the form that owns it keeps its own submit logic and endpoint, and
   passes `done` (shown in place of the field) only after a 2xx.

   `invalid` turns the pill's edge red; the message itself belongs in `note`,
   which is tied to the input with aria-describedby. */

export function PillField({
  label,
  button,
  note,
  invalid,
  done,
  size = 'md',
  className,
  ...input
}: {
  label: string;
  button: ReactNode;
  note?: ReactNode;
  invalid?: boolean;
  done?: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>) {
  const noteId = useId();
  if (done) {
    return (
      <p className={['done3', className].filter(Boolean).join(' ')} data-size={size} role="status">
        <Check />
        {done}
      </p>
    );
  }
  return (
    <div className={['pillf', className].filter(Boolean).join(' ')} data-size={size} data-invalid={invalid ? '' : undefined}>
      <label className="nf">
        <span className="sr-only">{label}</span>
        <input {...input} aria-invalid={invalid || undefined} aria-describedby={note ? noteId : undefined} />
        {button}
      </label>
      {note && (
        <p className="nnote" id={noteId}>
          {note}
        </p>
      )}
    </div>
  );
}
