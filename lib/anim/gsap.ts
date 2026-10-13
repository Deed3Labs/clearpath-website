'use client';

/* The one place GSAP is imported and ScrollTrigger is registered. Every
   animated component goes through here, so the plugin is registered exactly
   once however many of them mount. */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* Reduced motion means the server-rendered end state is the whole story:
   nothing animates, nothing is hidden first. */
export const motionOK = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };
