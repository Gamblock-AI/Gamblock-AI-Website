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
    <section className="border-y border-border bg-card/80 px-6 py-9 backdrop-blur-sm md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-label mb-6 text-center text-muted-foreground">
          {t('supportersLabel')}
        </p>
        <div className="grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-x-10 md:gap-y-5">
          {SUPPORTERS.map((supporter) => (
            <span
              key={supporter.name}
              className="flex min-w-0 items-center justify-center gap-3 md:shrink-0"
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
