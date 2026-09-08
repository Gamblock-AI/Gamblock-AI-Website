'use client';

import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

export function HeroSection() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [videoFrameReady, setVideoFrameReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markFrameReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setVideoFrameReady(true);
    };
    const syncPlayback = () => {
      if (document.visibilityState === 'hidden' || reduceMotion) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    markFrameReady();
    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [reduceMotion]);

  return (
    <section className="relative isolate overflow-hidden bg-[#081a39] px-4 pb-28 pt-32 sm:px-6 md:px-10 md:pb-36 md:pt-40">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-75"
        style={{ backgroundImage: "url('/videos/landing/hero-background.v2-poster.webp')" }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/landing/hero-background.v2-poster.webp"
        onLoadedData={() => setVideoFrameReady(true)}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 size-full object-cover transition-opacity duration-200 motion-reduce:transition-none ${videoFrameReady && !reduceMotion ? 'opacity-100' : 'opacity-0'}`}
      >
        <source src="/videos/landing/hero-background.v2.mp4" type="video/mp4" media="(prefers-reduced-motion: no-preference)" />
        <source src="/videos/landing/hero-background.v2.webm" type="video/webm" media="(prefers-reduced-motion: no-preference)" />
      </video>
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgba(3,14,35,0.95)_0%,rgba(6,25,56,0.83)_42%,rgba(6,23,52,0.42)_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-48 top-1/4 -z-[4] size-[34rem] rounded-full border border-sky/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-1/3 -z-[4] size-[24rem] rounded-full border border-white/10" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[82rem] items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
          <h1 className="marketing-display mt-4 max-w-4xl text-[clamp(2.35rem,3.65vw,4.25rem)] text-white">
            <span className="block">{t('titleLead')}</span>
            <span className="block text-sky">{t('titleAccent')}</span>
            <span className="block">{t('titleTail')}</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg md:leading-8">{t('subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<Link href={ROUTES.REGISTER} />} variant="primary" size="lg" className="rounded-2xl bg-[#c8102e] px-6 text-white shadow-[0_14px_0_#7f091d] hover:translate-y-0.5 hover:bg-[#da1c3a] hover:shadow-[0_11px_0_#7f091d] focus-visible:ring-[#f5a9b5] motion-reduce:transform-none">
              {t('btnStart')}
              <ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href={ROUTES.TECHNOLOGY} />} variant="outline" size="lg" className="rounded-2xl border-white/25 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/70">
              <BookOpen className="size-4" />
              {t('btnLearn')}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl pb-2 lg:pb-0">
          <div className="relative ml-auto max-w-[28rem] rotate-[-3deg] overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 p-5 text-navy shadow-[0_30px_70px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-label text-navy/45">{t('snapshotKicker')}</p>
                <p className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-navy">{t('snapshotTitle')}</p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky text-navy"><ShieldCheck className="size-5" /></span>
            </div>
            <p className="mt-4 text-sm leading-6 text-navy/65">{t('snapshotBody')}</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-azure"><div className="h-full w-3/4 rounded-full bg-[#c8102e]" /></div>
            <div className="mt-3 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.12em] text-navy/45"><span>{t('snapshotProgressLabel')}</span><span>{t('snapshotProgressValue')}</span></div>
          </div>
          <div className="relative -mt-8 mr-auto max-w-[17rem] rotate-[4deg] rounded-[1.65rem] border border-white/20 bg-[#c8102e] p-5 text-white shadow-[0_20px_45px_rgba(0,0,0,0.26)] sm:-mt-12">
            <p className="text-label text-white/65">{t('heroStatSource')}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{t('heroStatValue')}</p>
            <p className="mt-2 text-xs leading-5 text-white/80">{t('heroStatLabel')}</p>
          </div>
          <p className="mt-7 max-w-sm text-xs leading-5 text-white/55 lg:ml-6">{t('trustLabel')}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-20 bg-[#f4faff] [clip-path:ellipse(72%_100%_at_50%_100%)]" aria-hidden="true" />
      <span className="sr-only">{locale === 'id' ? 'Video latar Gamblock-AI' : 'Gamblock-AI background video'}</span>
    </section>
  );
}
