'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/* The variant picked on a product whose pictures and drawing follow it (the
   Logo Patch: Square or Circle), shared by the buy panel's picker and the
   gallery, the way ColourContext shares a garment's colour. */

type Picked = { variant: string; pick: (id: string) => void };

const Ctx = createContext<Picked | null>(null);

export function OptionProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const [variant, pick] = useState(initial);
  return <Ctx.Provider value={{ variant, pick }}>{children}</Ctx.Provider>;
}

export function useOption(): Picked | null {
  return useContext(Ctx);
}
