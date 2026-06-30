'use client';

import { ScanSearch, Zap, Users, HeartPulse } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';
import { FeatureRow } from '@/components/landing/FeatureRow';

/**
 * FeaturesSection — the four defense layers as alternating image/text rows.
 */
export function FeaturesSection() {
  const t = useTranslations('LandingPage');

  const features = [
    {
      icon: ScanSearch,
      kicker: t('f1Kicker'),
      title: t('f1Title'),
      body: t('f1Body'),
      bullets: [t('f1Bullet1'), t('f1Bullet2'), t('f1Bullet3')],
      image: '/images/features/deteksi.jpg',
      imageAlt: 'Ilustrasi deteksi cerdas berbasis On-Device AI',
      reversed: false,
    },
    {
      icon: Zap,
      kicker: t('f2Kicker'),
      title: t('f2Title'),
      body: t('f2Body'),
      bullets: [t('f2Bullet1'), t('f2Bullet2'), t('f2Bullet3')],
      image: '/images/features/intervensi.jpg',
      imageAlt: 'Ilustrasi intervensi Pattern Interrupt',
      reversed: true,
    },
    {
      icon: Users,
      kicker: t('f3Kicker'),
      title: t('f3Title'),
      body: t('f3Body'),
      bullets: [t('f3Bullet1'), t('f3Bullet2'), t('f3Bullet3')],
      image: '/images/features/komitmen.jpg',
      imageAlt: 'Ilustrasi accountability partner',
      reversed: false,
    },
    {
      icon: HeartPulse,
      kicker: t('f4Kicker'),
      title: t('f4Title'),
      body: t('f4Body'),
      bullets: [t('f4Bullet1'), t('f4Bullet2'), t('f4Bullet3')],
      image: '/images/mascot/gami-meditate.png',
      imageAlt: 'Gami dalam mode pemulihan yang tenang',
      reversed: true,
    },
  ];

  return (
    <Section id="fitur" tone="white">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center">
        <Pill variant="navy" className="mb-4">
          {t('featuresKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('featuresTitle')}</h2>
        <p className="mt-4 text-base text-muted-foreground">{t('featuresSubtitle')}</p>
      </Reveal>

      <div className="space-y-20 md:space-y-28">
        {features.map((f) => (
          <FeatureRow key={f.kicker} {...f} />
        ))}
      </div>
    </Section>
  );
}
