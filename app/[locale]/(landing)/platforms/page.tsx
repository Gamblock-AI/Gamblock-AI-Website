import type { Metadata } from 'next';
import { ArrowRight, Check, LockKeyhole, Monitor, ShieldCheck, Smartphone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SkipLink } from '@/components/landing/SkipLink';
import { ROUTES } from '@/routes';

const PLATFORM_CARDS = [
  {
    id: 'android',
    icon: Smartphone,
    eyebrow: 'androidEyebrow',
    title: 'androidTitle',
    body: 'androidBody',
    points: ['androidPoint1', 'androidPoint2', 'androidPoint3'],
    className: 'border-sky/25 bg-sky text-navy',
    iconClassName: 'bg-navy text-sky',
    labelClassName: 'bg-navy text-white',
    bodyClassName: 'text-navy/70',
  },
  {
    id: 'windows',
    icon: Monitor,
    eyebrow: 'windowsEyebrow',
    title: 'windowsTitle',
    body: 'windowsBody',
    points: ['windowsPoint1', 'windowsPoint2', 'windowsPoint3'],
    className: 'border-white/15 bg-navy text-white',
    iconClassName: 'bg-white/10 text-sky',
    labelClassName: 'bg-white/12 text-white',
    bodyClassName: 'text-white/70',
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DeviceOptionsPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PlatformsPage() {
  const t = await getTranslations('DeviceOptionsPage');

  return (
    <div className="relative bg-[#f4faff] text-foreground">
      <SkipLink />
      <FixedBackground />
      <MarketingNav minimal />
      <main id="main-content">
        <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 md:px-10 md:pb-24 md:pt-40">
          <div className="pointer-events-none absolute -left-24 top-24 size-80 rounded-full border-[1.5rem] border-sky/20" aria-hidden="true" />
          <div className="pointer-events-none absolute right-[-8rem] top-8 size-96 rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-[72rem] text-center">
            <p className="text-label text-[#c8102e]">{t('heroKicker')}</p>
            <h1 className="marketing-display mx-auto mt-4 max-w-3xl text-4xl text-navy md:text-6xl">{t('heroTitle')}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-navy/65 md:text-lg md:leading-8">{t('heroBody')}</p>
            <Button render={<Link href={ROUTES.TECHNOLOGY} />} variant="outline" size="default" className="mt-8 rounded-full border-navy/20 bg-white/70 text-navy hover:bg-white focus-visible:ring-navy">
              {t('backToTechnology')}<ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <section className="relative px-4 pb-20 sm:px-6 md:px-10 md:pb-24">
          <div className="mx-auto grid max-w-[72rem] gap-5 lg:grid-cols-2">
            {PLATFORM_CARDS.map(({ id, icon: Icon, eyebrow, title, body, points, className, iconClassName, labelClassName, bodyClassName }) => (
              <article key={id} className={`relative overflow-hidden rounded-[2rem] border p-7 shadow-[0_20px_50px_rgba(20,52,100,0.14)] sm:p-9 ${className}`}>
                <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border-[1.25rem] border-current opacity-10" aria-hidden="true" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <span className={`flex size-12 items-center justify-center rounded-2xl ${iconClassName}`}><Icon className="size-6" /></span>
                  <span className={`rounded-full px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.1em] ${labelClassName}`}>{t('prototypeStatus')}</span>
                </div>
                <div className="relative z-10 mt-8">
                  <p className="text-label opacity-60">{t(eyebrow)}</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t(title)}</h2>
                  <p className={`mt-4 text-base leading-7 ${bodyClassName}`}>{t(body)}</p>
                  <ul className="mt-7 space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm font-semibold leading-5">
                        <Check className="mt-0.5 size-4 shrink-0" />{t(point)}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative bg-[#0b1730] px-4 py-20 text-white sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-[72rem] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-label text-sky">{t('sharedKicker')}</p>
              <h2 className="marketing-display mt-4 max-w-2xl text-4xl md:text-5xl">{t('sharedTitle')}</h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{t('sharedBody')}</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-7 sm:p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-sky text-navy"><LockKeyhole className="size-6" /></span>
              <div className="mt-7 space-y-4">
                {['sharedPoint1', 'sharedPoint2', 'sharedPoint3'].map((point) => (
                  <p key={point} className="flex items-center gap-3 text-sm font-bold text-white/85"><ShieldCheck className="size-4 text-sky" />{t(point)}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto flex max-w-[72rem] flex-col items-start justify-between gap-6 rounded-[2rem] bg-sky p-8 text-navy shadow-[0_20px_50px_rgba(20,52,100,0.16)] sm:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{t('helpTitle')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-navy/70">{t('helpBody')}</p>
            </div>
            <Button render={<Link href={ROUTES.HELP} />} variant="primary" size="lg" className="shrink-0 rounded-2xl bg-[#c8102e] px-6 text-white shadow-[0_12px_0_#7f091d] hover:translate-y-0.5 hover:bg-[#da1c3a] hover:shadow-[0_9px_0_#7f091d] focus-visible:ring-navy motion-reduce:transform-none">
              {t('helpButton')}<ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
