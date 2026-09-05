'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

export function HeroSection() {
  const t = useTranslations('LandingPage');
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (document.visibilityState === 'hidden' || reduceMotion) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // Autoplay can be rejected by the browser; the poster remains visible.
      });
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [reduceMotion]);

  return (
    <section className="relative isolate flex min-h-[min(46rem,100dvh)] items-center overflow-hidden bg-navy px-4 pt-28 pb-20 sm:px-6 md:min-h-[42rem] md:px-10 md:pt-32 lg:min-h-[calc(100dvh-1rem)]">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-80"
        style={{ backgroundImage: "url('/videos/landing/hero-background.v1-poster.webp')" }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/landing/hero-background.v1-poster.webp"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${videoReady && !reduceMotion ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/videos/landing/hero-background.v1.webm" type="video/webm" />
        <source src="/videos/landing/hero-background.v1.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(180deg,rgba(6,22,50,0.80)_0%,rgba(10,31,65,0.48)_45%,rgba(6,15,35,0.88)_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(circle_at_50%_45%,rgba(61,214,245,0.18),transparent_52%)]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[90rem] text-center">
        <div className="mx-auto max-w-[90rem]">
          <Reveal delay={0.05}>
            <div className="mx-auto max-w-[90rem]">
              <h1 className="text-display text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[1.04] text-white">
                <span className="block whitespace-normal sm:whitespace-nowrap">{t('titleLead')}</span>
                <span className="text-sky block whitespace-normal sm:whitespace-nowrap">{t('titleAccent')}</span>
                <span className="block whitespace-normal sm:whitespace-nowrap">{t('titleTail')}</span>
              </h1>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
              {t('subtitle')}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                render={<Link href={ROUTES.REGISTER} />}
                variant="accent"
                size="lg"
                className="rounded-full px-7 shadow-card"
              >
                {t('btnStart')}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href={ROUTES.TECHNOLOGY} />}
                variant="outline"
                size="lg"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/70"
              >
                <BookOpen className="size-4" />
                {t('btnLearn')}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
