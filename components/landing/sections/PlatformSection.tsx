'use client';

import Image from 'next/image';
import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { ROUTES } from '@/routes';

export function PlatformSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section tone="white" className="py-20 md:py-28">
      <div className="border-navy/8 overflow-hidden rounded-[2.5rem] border bg-white shadow-[0_30px_90px_rgba(22,41,76,0.12)]">
        <div className="grid items-stretch lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <Pill variant="navy" className="mb-4">
              {t('platformKicker')}
            </Pill>
            <h2 className="text-heading text-navy text-3xl md:text-4xl">{t('platformTitle')}</h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
              {t('platformBody')}
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <PlatformBadge icon={Smartphone} label={t('platformAndroid')} />
              <PlatformBadge icon={Monitor} label={t('platformWindows')} />
            </div>
            <Link href={ROUTES.DOWNLOAD} className="mt-8 inline-block">
              <Button variant="primary" size="lg" className="rounded-full">
                {t('linkDownload')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Reveal>

          <Reveal
            delay={0.08}
            className="relative min-h-[24rem] overflow-hidden sm:min-h-[30rem] lg:min-h-0 lg:self-stretch"
          >
            <Image
              src="/images/landing/generated/platform-student-context.webp"
              alt="Mahasiswa berjalan di kampus ditemani Gami dalam satu alur perlindungan"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center"
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function PlatformBadge({ icon: Icon, label }: { icon: typeof Smartphone; label: string }) {
  return (
    <span className="border-navy/10 bg-navy/[0.04] text-navy inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}
