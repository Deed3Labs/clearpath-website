import { money } from '@/lib/format';

/* A figure as the app's lists print it: two places, no dollar sign. */
export const amt = (n: number) => money(n).slice(1);

/* A discount line: a true minus sign, then the figure. */
export const minus = (n: number) => '−' + amt(Math.abs(n));
