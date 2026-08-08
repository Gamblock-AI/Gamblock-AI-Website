'use client';

import Image from 'next/image';
import { ExternalLink, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';

export function HotlineWorkspace() {
  const t = useTranslations('supportWorkspace');

  const hotlines = [
    {
      key: 'komdigi',
      logo: '/images/org/logo-kemkomdigi.svg',
      accent: 'navy',
      title: t('hotlineKomdigiTitle'),
      number: '159',
      dialNumber: '159',
      description: t('hotlineKomdigiDescription'),
    },
    {
      key: 'polri',
      logo: '/images/org/logo-polri.svg',
      accent: 'navy',
      title: t('hotlinePolriTitle'),
      number: '110',
      dialNumber: '110',
      description: t('hotlinePolriDescription'),
    },
    {
      key: 'sejiwa',
      logo: '/images/org/logo-kemenkes.svg',
      accent: 'navy',
      title: t('hotlineSejiwaTitle'),
      number: '119 ext 8',
      dialNumber: '119',
      description: t('hotlineSejiwaDescription'),
    },
    {
      key: 'sapa',
      logo: '/images/org/logo-kemenpppa.svg',
      accent: 'navy',
      title: t('hotlineSapaTitle'),
      number: '129',
      dialNumber: '129',
      description: t('hotlineSapaDescription'),
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {hotlines.map((item) => (
        <DashboardPanel
          key={item.key}
          title={item.title}
          description={item.description}
          accent={item.accent}
          density="compact"
          icon={Phone}
          action={
            <a
              href={`tel:${item.dialNumber}`}
              className="bg-navy hover:bg-navy-light inline-flex min-h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white transition-colors"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {item.number}
            </a>
          }
        >
          <div className="bg-muted/60 flex items-center gap-3 rounded-xl border p-3 text-sm">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
              <Image
                src={item.logo}
                alt={item.title}
                width={48}
                height={48}
                className="size-full object-contain"
              />
            </span>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-bold">{item.title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                {item.dialNumber !== item.number
                  ? t('hotlineCallDescriptionExt')
                  : t('hotlineCallDescription')}
              </p>
            </div>
          </div>
        </DashboardPanel>
      ))}
    </div>
  );
}
