'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

export function HeroSection() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (document.visibilityState === 'hidden' || motionPreference.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    motionPreference.addEventListener('change', syncPlayback);
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      motionPreference.removeEventListener('change', syncPlayback);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[100dvh] overflow-hidden bg-[#081a39] px-4 py-32 sm:px-6 md:px-10 md:py-36">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-75"
        style={{ backgroundImage: "url('/videos/landing/hero-background.v2-poster.webp')" }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/landing/hero-background.v2-poster.webp"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-100 motion-reduce:!opacity-0"
      >
        <source src="/videos/landing/hero-background.v2.mp4" type="video/mp4" media="(prefers-reduced-motion: no-preference)" />
        <source src="/videos/landing/hero-background.v2.webm" type="video/webm" media="(prefers-reduced-motion: no-preference)" />
      </video>
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgba(3,14,35,0.92)_0%,rgba(5,23,52,0.72)_38%,rgba(5,23,52,0.2)_70%,rgba(5,23,52,0.08)_100%)]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-[82rem] items-center justify-center">
        <div className="w-full max-w-[68rem] text-center">
          <div className="mx-auto mb-7 h-1 w-14 rounded-full bg-sky" aria-hidden="true" />
          <h1 className="mx-auto max-w-[28ch] text-[clamp(2.5rem,4.4vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-white drop-shadow-[0_6px_24px_rgba(3,14,35,0.72)]">
            <span>{t('titleLead')} </span>
            <span className="text-sky">{t('titleAccent')} </span>
            <span>{t('titleTail')}</span>
          </h1>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button render={<Link href={ROUTES.REGISTER} />} variant="primary" size="lg" className="rounded-full bg-[#c8102e] px-7 text-white shadow-[0_14px_30px_-12px_rgba(200,16,46,0.78)] hover:bg-[#da1c3a] focus-visible:ring-[#f5a9b5]">
              {t('btnStart')}
              <ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href={ROUTES.TECHNOLOGY} />} variant="outline" size="lg" className="rounded-full border-white/30 bg-[#071a3a]/35 px-6 text-white backdrop-blur-sm hover:bg-white/15 focus-visible:ring-white/70">
              <BookOpen className="size-4" />
              {t('btnLearn')}
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" aria-hidden="true" />
      <span className="sr-only">{locale === 'id' ? 'Video latar Gamblock-AI' : 'Gamblock-AI background video'}</span>
    </section>
  );
}
