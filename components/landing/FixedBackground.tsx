/**
 * FixedBackground — a single full-viewport gradient that stays put while the
 * page content scrolls over it (tina.io style). Rendered once per marketing
 * page, behind everything (-z-10). Solid navy/crimson sections paint over it.
 */
export function FixedBackground() {
  return <div aria-hidden className="bg-mesh pointer-events-none fixed inset-0 -z-10" />;
}
