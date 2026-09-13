/* Dollars from cents. Arithmetic rather than Intl.NumberFormat, for the same
   reason as the join form's usdCompact: Node and the browser disagree on some
   Intl output, and a price rendered on the server and again on the client
   has to match to the character or React throws a hydration error. */
export function usd(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rest = abs % 100;
  return `${sign}$${dollars}${rest ? `.${rest.toString().padStart(2, '0')}` : ''}`;
}

/* Always two decimals, for totals where $32 next to $7.45 would look ragged. */
export function usdExact(cents: number): string {
  const s = usd(cents);
  return s.includes('.') ? s : `${s}.00`;
}
