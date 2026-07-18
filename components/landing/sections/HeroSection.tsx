'use client';

import Image from 'next/image';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

export function HeroSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-16 md:px-10 lg:min-h-[100dvh]">
      <GradientBlob className="top-20 left-[-8rem] h-80 w-80" color="bg-sky-light" />
      <GradientBlob className="top-32 right-[-6rem] h-96 w-96" color="bg-azure" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-[0.94fr_1.06fr] lg:gap-8">
        <div>
          <Reveal>
            <span className="border-navy/10 text-navy shadow-soft inline-flex items-center gap-2 rounded-full border bg-white/75 px-4 py-2 text-xs font-bold tracking-[0.14em] uppercase backdrop-blur">
              <ShieldCheck className="text-sky h-4 w-4" />
              {t('badgeNewText')}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-display text-navy mt-7 max-w-3xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {t('titleLead')}{' '}
              <span className="text-crimson">{t('titleAccent')}</span>{' '}
              {t('titleTail')}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-8 md:text-lg">
              {t('subtitle')}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-7 shadow-[0_14px_30px_rgba(22,41,76,0.18)]"
                >
                  {t('btnStart')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/technology">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-navy/15 rounded-full bg-white/70"
                >
                  <BookOpen className="h-4 w-4" />
                  {t('btnLearn')}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal
          delay={0.1}
          className="relative flex min-h-[31rem] items-center justify-center lg:-mr-12 lg:min-h-[calc(100dvh-7rem)] lg:justify-end"
        >
          <div className="absolute h-[68%] w-[68%] rounded-full bg-cyan-200/35 blur-3xl" aria-hidden />
          <div className="bg-navy/10 absolute bottom-[8%] h-16 w-[68%] rounded-full blur-2xl" aria-hidden />
          <Image
            src="/images/landing/generated/gami-guide-hero.webp"
            alt="Gami, pendamping digital Gamblock-AI, melambai dengan ramah"
            width={862}
            height={1256}
            preload
            sizes="(max-width: 1024px) 82vw, 46vw"
            className="relative h-[31rem] w-auto max-w-full object-contain drop-shadow-[0_34px_48px_rgba(22,41,76,0.24)] select-none sm:h-[36rem] lg:h-[min(76dvh,46rem)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
