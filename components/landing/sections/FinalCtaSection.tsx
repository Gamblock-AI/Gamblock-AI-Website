import Image from 'next/image';
import { ArrowRight, LifeBuoy, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/common/Reveal';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

export function FinalCtaSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden bg-white px-4 pb-24 pt-4 sm:px-6 md:px-10 md:pb-32">
      <SectionDecoration className="-left-6 bottom-10" tone="pink" />
      <SectionDecoration className="-right-6 top-8 -rotate-12" tone="sky" />
      <Reveal className="relative z-10 mx-auto grid max-w-[82rem] overflow-hidden rounded-[2.75rem] bg-[#f7fbfe] shadow-[0_28px_72px_-32px_rgba(22,41,76,0.38)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10 flex flex-col justify-center overflow-hidden bg-white/85 p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#eaf8ff]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -right-14 size-48 rotate-12 rounded-[2.5rem] border-[0.9rem] border-[#c8102e]/10" aria-hidden="true" />

          <div className="relative flex items-center gap-4">
            <p className="rounded-full bg-[#fff0f3] px-4 py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#c8102e]">09 / Gamblock-AI</p>
            <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
          </div>
          <h2 className="marketing-display relative mt-6 max-w-3xl text-4xl text-navy md:text-6xl">{t('ctaTitle')}</h2>
          <p className="relative mt-5 max-w-xl text-base font-medium leading-7 text-navy/75">{t('ctaBody')}</p>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button render={<Link href={ROUTES.REGISTER} />} variant="primary" size="lg" className="min-h-12 rounded-full bg-[#c8102e] px-6 text-white shadow-[0_14px_28px_-12px_rgba(200,16,46,0.72)] hover:bg-[#da1c3a] focus-visible:ring-[#c8102e]/45">
              {t('ctaButton')}<ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href={ROUTES.HELP} />} variant="outline" size="lg" className="min-h-12 rounded-full border-navy/10 bg-[#edf8ff] text-navy hover:border-sky hover:bg-[#dff5ff] focus-visible:ring-sky/50">
              <LifeBuoy className="size-4" />{t('btnHelp')}
            </Button>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-2 text-xs font-bold text-navy/65">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f2f7fb] px-3 py-2"><Smartphone className="size-4 text-[#c8102e]" aria-hidden="true" />{t('ctaAndroid')}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f2f7fb] px-3 py-2"><Monitor className="size-4 text-[#c8102e]" aria-hidden="true" />{t('ctaWindows')}</span>
          </div>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden bg-gradient-to-br from-[#e8f8ff] via-[#d8f4ff] to-[#beeaff] lg:min-h-[38rem]">
          <div className="marketing-dot-field pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/45 sm:size-[28rem]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/55" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-8 left-1/2 h-10 w-[68%] -translate-x-1/2 rounded-[50%] bg-navy/15 blur-xl" aria-hidden="true" />
          <Image
            src="/images/mascot/gami-wave.webp"
            alt={t('ctaImageAlt')}
            width={768}
            height={768}
            sizes="(max-width: 1024px) 88vw, 40vw"
            className="absolute bottom-3 left-1/2 z-10 h-[88%] w-auto max-w-[94%] -translate-x-1/2 object-contain drop-shadow-[0_24px_24px_rgba(22,41,76,0.2)] sm:h-[92%] lg:bottom-1"
          />
        </div>
      </Reveal>
    </section>
  );
}
