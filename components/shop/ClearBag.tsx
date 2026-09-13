'use client';

import { useEffect } from 'react';
import { useBag } from './BagProvider';

/* On the thank-you page: the order is placed, so the bag is spent. Waits for
   storage to be read first, or the stored bag would load back over it. */
export function ClearBag() {
  const { ready, clear } = useBag();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
