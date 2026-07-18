'use client';

import Image from 'next/image';
import { ArrowRight, LifeBuoy, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

export function FinalCtaSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-10 md:py-28">
      <div className="relative mx-auto grid max-w-6xl items-center overflow-hidden rounded-[2.5rem] bg-navy px-7 pb-0 pt-10 shadow-[0_32px_90px_rgba(22,41,76,0.22)] sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:pt-14">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky/15 blur-3xl" aria-hidden />
        <Reveal className="relative z-10 pb-10 lg:pb-14">
          <p className="text-label text-cyan-300">{t('psychoKicker')}</p>
          <h2 className="mt-4 max-w-2xl text-display text-3xl text-white md:text-5xl">
            {t('ctaTitle')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/65">{t('ctaBody')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="lg"
                className="rounded-full border-white bg-white text-navy hover:bg-white/90"
              >
                {t('ctaButton')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={ROUTES.HELP}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                <LifeBuoy className="h-4 w-4" />
                {t('btnHelp')}
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-white/55">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> {t('ctaAndroid')}
            </span>
            <span className="inline-flex items-center gap-2">
              <Monitor className="h-4 w-4" /> {t('ctaWindows')}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative flex h-full min-h-72 items-end justify-center lg:min-h-[25rem]">
          <div className="absolute bottom-0 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" aria-hidden />
          <Image
            src="/images/landing/generated/gami-encourage.webp"
            alt="Gami memberi dukungan untuk memulai langkah pemulihan"
            width={1024}
            height={1536}
            sizes="(max-width: 1024px) 70vw, 35vw"
            className="relative h-[24rem] w-auto max-w-full object-contain object-bottom drop-shadow-[0_28px_40px_rgba(0,0,0,0.24)] lg:h-[29rem]"
          />
        </Reveal>
      </div>
    </section>
  );
}
