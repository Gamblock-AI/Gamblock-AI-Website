'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function BiteSizedLearning() {
  const t = useTranslations('recoveryDashboard');
  
  return (
    <section className="rounded-[1.5rem] border border-sage/20 bg-sage/[0.055] p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
          <Lightbulb className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-navy">{t('biteSizedLearningTitle')}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t('biteSizedLearningDesc')}
          </p>
          <Link
            href={ROUTES.EDUCATION}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sage hover:underline"
          >
            {t('biteSizedLearningLink')}
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
