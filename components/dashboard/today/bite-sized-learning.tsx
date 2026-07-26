'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { useSyncExternalStore } from 'react';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const BITE_FACT_COUNT = 12;

// Deterministic per-date rotation; fact 1 during SSR, the dated fact swaps in
// right after hydration (text-only, no motion). Cached per session.
const subscribeNever = () => () => {};
let clientFactIndex: number | null = null;
const getFactIndexSnapshot = () => {
  if (clientFactIndex === null) {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    clientFactIndex = dayOfYear % BITE_FACT_COUNT;
  }
  return clientFactIndex;
};
const getFactIndexServerSnapshot = () => 0;

export function BiteSizedLearning() {
  const t = useTranslations('recoveryDashboard');
  const factIndex = useSyncExternalStore(
    subscribeNever,
    getFactIndexSnapshot,
    getFactIndexServerSnapshot
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          className="bg-sky-light/45 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
          aria-hidden="true"
        >
          <Image
            src="/images/mascot/gami-point.webp"
            alt=""
            width={40}
            height={40}
            className="size-9 object-contain"
          />
        </span>
        <h3 className="min-w-0 text-[0.9375rem] leading-6 font-bold text-navy">
          {t('biteSizedLearningTitle')}
        </h3>
      </div>
      <FadeSwap swapKey={factIndex}>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t(`biteFact${factIndex + 1}`)}
        </p>
      </FadeSwap>
      <Link
        href={ROUTES.EDUCATION}
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold text-sage outline-none hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        {t('biteSizedLearningLink')}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
