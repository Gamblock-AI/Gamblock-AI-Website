'use client';

import { useTranslations } from 'next-intl';

/**
 * SkipLink — keyboard-first shortcut to the page's main content. Rendered
 * off-screen until focused; every landing-shell page mounts one so keyboard
 * users are not forced through the marketing navigation.
 */
export function SkipLink({ target = '#main-content' }: { target?: string }) {
  const t = useTranslations('LandingPage');

  return (
    <a
      href={target}
      className="bg-navy shadow-card focus-visible:ring-sky fixed top-4 left-4 z-[60] -translate-y-24 rounded-full px-5 py-3 text-sm font-bold text-white transition-transform outline-none focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      {t('skipLink')}
    </a>
  );
}
