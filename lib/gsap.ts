import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Central GSAP setup. Registers ScrollTrigger exactly once on the client.
 * Import { gsap, ScrollTrigger } from '@/lib/gsap' in animated components
 * instead of registering the plugin ad-hoc in each file.
 */
let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
