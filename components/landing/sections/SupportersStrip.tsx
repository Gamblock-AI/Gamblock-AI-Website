'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Marquee } from '@/components/ui/marquee';

// PKM-KC supporting / organizing institutions (verified):
// - Kemdiktisaintek: ministry that organizes PKM
// - Ditjen Dikti: organizing directorate
// - Belmawa: official PKM service portal
// - Universitas Teknologi Yogyakarta: host campus
// - PKM Corner UTY: UTY's PKM support unit
// Logos are placeholders until official marks are supplied.
const SUPPORTERS = [
  { name: 'Kemdiktisaintek', src: '/images/supporters/kemdiktisaintek-new.png' },
  { name: 'Ditjen Dikti', src: '/images/supporters/ditjen-dikti-new.png' },
  { name: 'Belmawa', src: '/images/supporters/belmawa-new.png' },
  { name: 'Universitas Teknologi Yogyakarta', src: '/images/supporters/uty-new.png' },
  { name: 'PKM Corner UTY', src: '/images/supporters/pkmcorner-uty-new.png' },
] as const;

/**
 * SupportersStrip — institutions backing this PKM-KC program, shown as an
 * auto-scrolling logo marquee. Logos are placeholders for now.
 */
export function SupportersStrip() {
  const t = useTranslations('LandingPage');

  return (
    <section className="border-y border-white/40 bg-white/55 py-10 backdrop-blur-sm">
      <p className="text-label mb-7 text-center text-muted-foreground">{t('supportersLabel')}</p>
      <Marquee gapRem={4}>
        {SUPPORTERS.map((s) => (
          <span key={s.name} className="flex shrink-0 items-center gap-3" title={s.name}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-border">
              <Image
                src={s.src}
                alt={`Logo ${s.name}`}
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="text-sm font-bold tracking-tight whitespace-nowrap text-navy/75">
              {s.name}
            </span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
