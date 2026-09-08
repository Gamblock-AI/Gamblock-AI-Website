'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const SUPPORTERS = [
  { name: 'Kemdiktisaintek', src: '/images/supporters/kemdiktisaintek-new.png' },
  { name: 'Ditjen Dikti', src: '/images/supporters/ditjen-dikti-new.png' },
  { name: 'Belmawa', src: '/images/supporters/belmawa-new.png' },
  { name: 'Universitas Teknologi Yogyakarta', src: '/images/supporters/uty-new.png' },
  { name: 'PKM Corner UTY', src: '/images/supporters/pkmcorner-uty-new.png' },
] as const;

export function SupportersStrip() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden border-y border-border/80 bg-white/90 px-6 py-10 backdrop-blur-sm md:px-10 md:py-12">
      <div className="pointer-events-none absolute -left-24 top-1/2 size-48 -translate-y-1/2 rounded-full bg-sky/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-1/2 size-48 -translate-y-1/2 rounded-full bg-azure blur-3xl" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <p className="text-label relative mb-6 text-center text-navy/50">
          {t('supportersLabel')}
        </p>
        <div className="relative grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-x-10 md:gap-y-5">
          {SUPPORTERS.map((supporter) => (
            <span
              key={supporter.name}
              className="flex min-w-0 items-center justify-center gap-3 rounded-2xl px-2 py-1 md:shrink-0"
              title={supporter.name}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
                <Image
                  src={supporter.src}
                  alt={`Logo ${supporter.name}`}
                  width={36}
                  height={36}
                  className="size-8 object-contain"
                />
              </span>
              <span className="max-w-36 text-center text-sm font-bold leading-tight tracking-tight text-navy/70 md:max-w-40 md:text-left">
                {supporter.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
