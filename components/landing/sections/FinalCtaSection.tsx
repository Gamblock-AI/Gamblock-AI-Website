'use client';

import Image from 'next/image';
import { ArrowRight, LifeBuoy, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

export function FinalCtaSection() {
  const t = useTranslations('LandingPage');
  return (
    <section className="relative overflow-hidden bg-[#f4faff] px-4 pb-16 pt-2 sm:px-6 md:px-10 md:pb-20">
      <div className="relative mx-auto grid max-w-[82rem] overflow-hidden rounded-[2rem] bg-sky shadow-[0_24px_60px_rgba(20,52,100,0.2)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 p-7 sm:p-9 lg:p-12">
          <p className="text-label text-navy/55">10 / Gamblock-AI</p>
          <h2 className="marketing-display mt-3 max-w-3xl text-4xl text-navy md:text-5xl">{t('ctaTitle')}</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-navy/70">{t('ctaBody')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href={ROUTES.REGISTER} />} variant="primary" size="lg" className="rounded-2xl bg-[#c8102e] px-6 text-white shadow-[0_14px_0_#7f091d] hover:translate-y-0.5 hover:bg-[#da1c3a] hover:shadow-[0_11px_0_#7f091d] focus-visible:ring-[#f5a9b5] motion-reduce:transform-none">
              {t('ctaButton')}<ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href={ROUTES.HELP} />} variant="outline" size="lg" className="rounded-2xl border-navy/25 bg-white/45 text-navy hover:bg-white/80 focus-visible:ring-navy">
              <LifeBuoy className="size-4" />{t('btnHelp')}
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-navy/65">
            <span className="inline-flex items-center gap-2"><Smartphone className="size-4 text-[#c8102e]" />{t('ctaAndroid')}</span>
            <span className="inline-flex items-center gap-2"><Monitor className="size-4 text-[#c8102e]" />{t('ctaWindows')}</span>
          </div>
        </div>
        <div className="relative min-h-[20rem] overflow-hidden lg:min-h-0">
          <div className="absolute -right-20 -top-16 size-[24rem] rounded-full border-[1.5rem] border-white/30" aria-hidden="true" />
          <Image src="/images/landing/generated-v3/gami-cta-transparent.webp" alt={t('ctaImageAlt')} width={1024} height={1536} sizes="(max-width: 1024px) 88vw, 42vw" className="absolute bottom-[-1rem] left-1/2 h-[22rem] w-auto max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[0_30px_30px_rgba(20,52,100,0.22)] lg:h-[25rem]" />
        </div>
      </div>
    </section>
  );
}
