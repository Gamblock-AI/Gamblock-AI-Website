'use client';

import { ArrowRight, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FadeSwap } from '@/components/common/fade-swap';
import { useDayOfYear } from '@/hooks/use-daily-rotation';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const BITE_FACT_COUNT = 36;

export function BiteSizedLearning() {
  const t = useTranslations('recoveryDashboard');
  const dayIndex = useDayOfYear();
  // User-initiated offset over the deterministic daily base — still no
  // randomness in render.
  const [offset, setOffset] = useState(0);
  const factIndex = (dayIndex + offset) % BITE_FACT_COUNT;

  return (
    <section className="border-border bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-4">
      <div>
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
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            &quot;{t(`biteFact${factIndex + 1}`)}&quot;
          </p>
        </FadeSwap>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={ROUTES.EDUCATION}
          className="text-navy hover:text-navy-light focus-visible:ring-navy/30 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold outline-none focus-visible:ring-2"
        >
          {t('biteSizedLearningLink')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => setOffset((value) => value + 1)}
          className="text-muted-foreground hover:text-navy focus-visible:ring-navy/30 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg text-sm font-semibold outline-none focus-visible:ring-2"
        >
          <RefreshCcw className="size-3.5" aria-hidden="true" />
          {t('biteSizedLearningMore')}
        </button>
      </div>
    </section>
  );
}
