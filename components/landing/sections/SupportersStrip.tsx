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
    <section className="border-y border-navy/5 bg-white/70 px-6 py-10 backdrop-blur-sm md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-label mb-7 text-center text-muted-foreground">
          {t('supportersLabel')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 lg:justify-between">
          {SUPPORTERS.map((supporter) => (
            <span
              key={supporter.name}
              className="flex shrink-0 items-center gap-3"
              title={supporter.name}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-navy/5">
                <Image
                  src={supporter.src}
                  alt={`Logo ${supporter.name}`}
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
              </span>
              <span className="max-w-40 text-sm font-bold leading-tight tracking-tight text-navy/70">
                {supporter.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
