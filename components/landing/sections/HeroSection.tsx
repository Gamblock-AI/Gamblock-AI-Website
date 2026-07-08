'use client';

import { Link } from '@/i18n/routing';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { MascotFloat } from '@/components/landing/MascotFloat';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

/**
 * HeroSection — split hero: headline + CTAs on the left, floating Gami mascot
 * on the right, over a pastel mesh with decorative blobs (tina.io energy).
 */
export function HeroSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
      <GradientBlob className="left-[-6rem] top-24 h-72 w-72" color="bg-sky-light" />
      <GradientBlob className="right-[-4rem] bottom-10 h-80 w-80" color="bg-azure" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Copy */}
        <div>
          <Reveal delay={0.05}>
            <h1 className="text-display text-4xl text-navy sm:text-5xl md:text-6xl">
              {t('titleLead')}{' '}
              <span className="text-crimson">{t('titleAccent')}</span>{' '}
              {t('titleTail')}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('subtitle')}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button variant="accent" size="lg" className="rounded-full">
                  {t('btnStart')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/technology">
                <Button variant="outline" size="lg" className="rounded-full">
                  <Play className="h-4 w-4" />
                  {t('btnLearn')}
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Mini stat card */}
          <Reveal delay={0.24}>
            <div className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-crimson/10">
                <ShieldCheck className="h-6 w-6 text-crimson" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-navy">
                  {t('heroStatValue')}
                </p>
                <p className="max-w-[15rem] text-xs leading-snug text-muted-foreground">
                  {t('heroStatLabel')} <span className="text-navy/50">{t('heroStatSource')}</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Mascot */}
        <div className="relative flex justify-center md:justify-end">
          <MascotFloat
            alt="Gami, maskot Gamblock-AI, melambai menyambut"
            priority
            className="w-64 sm:w-80 md:w-[26rem]"
            parallax={40}
          />
        </div>
      </div>
    </section>
  );
}
