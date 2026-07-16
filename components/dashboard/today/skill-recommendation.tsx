'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Leaf, LockKeyhole, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface SkillRecommendationProps {
  title: string;
  summary: string;
  practice: string;
  reason: string;
  onAnother: () => void;
}

export function SkillRecommendation({
  title,
  summary,
  practice,
  reason,
  onAnother,
}: SkillRecommendationProps) {
  const t = useTranslations('recoveryDashboard');
  const [practising, setPractising] = useState(false);

  return (
    <section
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      aria-labelledby="skill-recommendation-title"
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">
            {t('skillEyebrow')}
          </p>
          <h2 id="skill-recommendation-title" className="mt-2 text-xl font-bold text-navy">
            {title}
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        </div>
        <div className="relative hidden size-24 shrink-0 sm:block" aria-hidden="true">
          <div className="absolute inset-2 rounded-full bg-sky-light/45" />
          <Image
            src="/images/mascot/gami-meditate.png"
            alt=""
            width={96}
            height={96}
            className="relative size-24 object-contain"
          />
        </div>
      </div>

      <div className="mx-5 mt-4 rounded-xl border border-border bg-muted/35 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <Leaf className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <p className="min-w-0 text-xs font-bold text-sage">{t('skillWhy')}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-foreground">{reason}</p>
      </div>

      {practising ? (
        <div className="mx-5 mt-4 rounded-xl border border-border bg-muted/35 p-4" role="region" aria-live="polite">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden="true" />
            <p className="text-sm leading-7 text-foreground">{practice}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 border-t border-border px-5 py-4">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full"
          onClick={() => setPractising((current) => !current)}
          aria-expanded={practising}
        >
          {practising ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
          {practising ? t('skillClose') : t('skillStart')}
          {!practising ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full text-navy"
          onClick={() => {
            setPractising(false);
            onAnother();
          }}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {t('skillAnother')}
        </Button>
      </div>

      <p className="flex items-start gap-2 border-t border-border bg-muted/30 px-5 py-3 text-xs leading-5 text-muted-foreground">
        <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {t('skillPrivateReason')}
      </p>
    </section>
  );
}
