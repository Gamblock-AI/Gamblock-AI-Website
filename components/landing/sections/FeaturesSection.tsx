'use client';

import Image from 'next/image';
import { HeartHandshake, HeartPulse, ScanSearch, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

const FEATURES = [
  {
    icon: ScanSearch,
    kicker: 'f1Kicker',
    title: 'f1Title',
    body: 'f1Body',
    image: '/images/landing/generated/pillar-detection.webp',
    alt: 'Laptop dengan simbol perlindungan untuk deteksi lokal',
    className: 'lg:col-span-7',
  },
  {
    icon: Sparkles,
    kicker: 'f2Kicker',
    title: 'f2Title',
    body: 'f2Body',
    image: '/images/landing/generated/pillar-interrupt.webp',
    alt: 'Susunan batu tenang dengan simbol jeda untuk Pattern Interrupt',
    className: 'lg:col-span-5',
  },
  {
    icon: HeartHandshake,
    kicker: 'f3Kicker',
    title: 'f3Title',
    body: 'f3Body',
    image: '/images/landing/generated/pillar-accountability.webp',
    alt: 'Dua mahasiswa Indonesia saling mendukung dalam percakapan',
    className: 'lg:col-span-5',
  },
  {
    icon: HeartPulse,
    kicker: 'f4Kicker',
    title: 'f4Title',
    body: 'f4Body',
    image: '/images/landing/generated/pillar-recovery.webp',
    alt: 'Mahasiswa menulis refleksi ditemani Gami',
    className: 'lg:col-span-7',
  },
] as const;

export function FeaturesSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section id="fitur" tone="pastel" className="py-20 md:py-28">
      <Reveal className="mx-auto mb-12 max-w-3xl text-center">
        <Pill variant="navy" className="mb-4">
          {t('featuresKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-5xl">{t('featuresTitle')}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {t('featuresSubtitle')}
        </p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-12">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.kicker} delay={index * 0.04} className={feature.className}>
              <article className="group grid h-full min-h-[31rem] overflow-hidden rounded-[2rem] border border-navy/8 bg-white shadow-soft transition-transform duration-300 hover:-translate-y-1 md:grid-rows-[15rem_1fr]">
                <div className="relative overflow-hidden bg-sky-light/35">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-label text-crimson">{t(feature.kicker)}</p>
                  </div>
                  <h3 className="mt-5 max-w-xl text-title text-xl leading-tight text-navy md:text-2xl">
                    {t(feature.title)}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {t(feature.body)}
                  </p>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
