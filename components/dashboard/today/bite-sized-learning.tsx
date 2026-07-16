'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function BiteSizedLearning() {
  const t = useTranslations('recoveryDashboard');

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
          <Lightbulb className="size-[1.125rem]" aria-hidden="true" />
        </span>
        <h3 className="min-w-0 text-[0.9375rem] leading-6 font-bold text-navy">
          {t('biteSizedLearningTitle')}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t('biteSizedLearningDesc')}
      </p>
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
