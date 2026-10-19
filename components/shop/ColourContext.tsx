'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Colour } from '@/content/shop';

/* The colour picked on a garment's page, shared by the gallery (which shows
   that colour's renders and mockups, and draws the plate on its ground) and
   the buy panel (which offers that colour's sizes). The first colour is the
   default. A product without colours never mounts this. */

type Picked = { colours: readonly Colour[]; colour: Colour; pick: (id: string) => void };

const Ctx = createContext<Picked | null>(null);

export function ColourProvider({ colours, children }: { colours: readonly Colour[]; children: ReactNode }) {
  const [id, setId] = useState(colours[0].id);
  const colour = colours.find((c) => c.id === id) ?? colours[0];
  return <Ctx.Provider value={{ colours, colour, pick: setId }}>{children}</Ctx.Provider>;
}

/* The colour picked, or null outside a ColourProvider. */
export function useColour(): Picked | null {
  return useContext(Ctx);
}
