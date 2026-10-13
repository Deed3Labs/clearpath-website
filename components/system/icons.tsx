import { LogoMark } from '@/components/marks/Logo';

/* The mockups' <symbol> sprite, as components. Every one is decorative: the
   control or sentence beside it already says what it means. Size comes from
   CSS (the mockups size each use in place), so none of these set a width. */

type P = { className?: string };
const hide = { 'aria-hidden': true, focusable: false } as const;

export function Arrow({ className }: P) {
  return (
    <svg viewBox="0 0 14 10" className={className} {...hide}>
      <path d="M0 5h12M8 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Check({ className }: P) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...hide}>
      <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Back({ className }: P) {
  return (
    <svg viewBox="0 0 9 15" className={className} {...hide}>
      <path d="M8 1L2 7.5 8 14" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Bell({ className }: P) {
  return (
    <svg viewBox="0 0 18 18" className={className} {...hide}>
      <path d="M4.5 12.5V8a4.5 4.5 0 0 1 9 0v4.5l1.5 1.5H3z M7.2 15.5a1.9 1.9 0 0 0 3.6 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus({ className }: P) {
  return (
    <svg viewBox="0 0 18 18" className={className} {...hide}>
      <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/* The keypad's delete key. */
export function Del({ className }: P) {
  return (
    <svg viewBox="0 0 24 16" className={className} {...hide}>
      <path d="M8 1h14v14H8L1 8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 5l6 6M18 5l-6 6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* The Clear mark, unaltered — the brand's own geometry, never redrawn. */
export function Mark({ className }: P) {
  return <LogoMark size={18} variant="solid" className={className} />;
}
