/* Number formatting that gives the same string on the server and in the
   browser. Intl is not the same function on both sides of hydration — compact
   notation once rendered "$400.0K" in Node and "$400K" in Chrome and threw a
   hydration error on /join — so figures are formatted with plain arithmetic. */

/* 1234567.8 → "1,234,568" (rounded to dp first, then grouped). */
function group(n: number, dp: number) {
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(dp);
  const [whole, frac] = fixed.split('.');
  const g = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + g + (frac ? '.' + frac : '');
}

/* money(940) → "$940.00"; money(151200, 0) → "$151,200". */
export function money(n: number, dp = 2) {
  const s = group(n, dp);
  return s.startsWith('-') ? '-$' + s.slice(1) : '$' + s;
}

/* int(15000) → "15,000". */
export function int(n: number) {
  return group(Math.round(n), 0);
}
