'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight, Smartphone, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/common/Reveal';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { ROUTES } from '@/routes';

/**
 * FinalCtaSection — closing conversion block: bold headline, primary CTA, and
 * platform/security reassurance badges, with Gami giving a thumbs-up.
 */
export function FinalCtaSection() {
  const t = useTranslations('LandingPage');

  const badges = [
    { icon: Smartphone, key: 'ctaAndroid' },
    { icon: Monitor, key: 'ctaWindows' },
  ] as const;

  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-10">
      <GradientBlob className="left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" color="bg-sky-light" />

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <Image
          src="/images/mascot/gami-thumbsup.png"
          alt="Gami memberi acungan jempol, mengajak memulai pemulihan"
          width={200}
          height={200}
          className="mx-auto mb-6 w-32 select-none drop-shadow-[0_20px_40px_rgba(22,41,76,0.2)] animate-float md:w-40"
        />
        <h2 className="text-display text-3xl text-navy md:text-5xl">{t('ctaTitle')}</h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          {t('ctaBody')}
        </p>
        <div className="mt-8 flex justify-center">
          <Link href={ROUTES.REGISTER}>
            <Button variant="accent" size="lg" className="rounded-full px-8">
              {t('ctaButton')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {badges.map(({ icon: Icon, key }) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-semibold text-navy/70 backdrop-blur"
            >
              <Icon className="h-3.5 w-3.5 text-crimson" />
              {t(key)}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
