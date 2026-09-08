/**
 * FixedBackground — a single full-viewport gradient that stays put while the
 * page content scrolls over it (tina.io style). Rendered once per marketing
 * page, behind everything (-z-10). Solid navy sections paint over it.
 */
export function FixedBackground() {
  return (
    <div aria-hidden className="bg-mesh pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 top-[18%] size-[28rem] rounded-full bg-sky/10 blur-3xl" />
      <div className="absolute -right-48 bottom-[8%] size-[34rem] rounded-full bg-azure/80 blur-3xl" />
    </div>
  );
}
