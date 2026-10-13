/* The counter app's keypad, typed the way a writer types: keys are pressed in
   order and the amount builds digit by digit. Shared by the hero and the
   counter steps. */

export const fee = (v: number) => Math.round(v * 2.5) / 100;

const MAP: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '.': 9, '0': 10 };

/* Presses `digits` on `keys`, calling `onStep` with the amount so far.
   Returns when (in seconds) the last key lands. `sched` lets the caller own
   the timers so it can cancel a run. */
export function keyIn(
  keys: HTMLElement,
  digits: string,
  onStep: (v: number) => void,
  t0 = 0,
  gap = 0.26,
  sched: (sec: number, fn: () => void) => void = (s, fn) => void window.setTimeout(fn, s * 1000),
) {
  let typed = '';
  digits.split('').forEach((d, i) =>
    sched(t0 + i * gap, () => {
      const k = keys.children[MAP[d]];
      k?.classList.add('hit');
      window.setTimeout(() => k?.classList.remove('hit'), 160);
      typed += d;
      onStep(+typed);
    }),
  );
  return t0 + digits.length * gap;
}
