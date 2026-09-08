'use client';

import Image from 'next/image';
import { ArrowUpRight, CircleAlert, Compass, PauseCircle, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const SUPPORTERS = [
  { name: 'Kemdiktisaintek', src: '/images/supporters/kemdiktisaintek-new.png' },
  { name: 'Ditjen Dikti', src: '/images/supporters/ditjen-dikti-new.png' },
  { name: 'Belmawa', src: '/images/supporters/belmawa-new.png' },
  { name: 'Universitas Teknologi Yogyakarta', src: '/images/supporters/uty-new.png' },
  { name: 'PKM Corner UTY', src: '/images/supporters/pkmcorner-uty-new.png' },
] as const;

const PROBLEMS = [
  { key: 'problemPoint1', icon: ShieldAlert },
  { key: 'problemPoint2', icon: CircleAlert },
  { key: 'problemPoint3', icon: PauseCircle },
] as const;

export function CrisisSection() {
  const t = useTranslations('LandingPage');
  const stats = [
    { value: 'Rp286,84 T', labelKey: 'crisisStat1Label', sourceKey: 'crisisStat1Source' },
    { value: '12,3 juta', labelKey: 'crisisStat2Label', sourceKey: 'crisisStat2Source' },
    { value: '960 ribu', labelKey: 'crisisStat3Label', sourceKey: 'crisisStat3Source' },
  ] as const;

  return (
    <section id="dampak" className="relative overflow-hidden bg-[#f4faff] px-4 pb-24 sm:px-6 md:px-10 md:pb-32">
      <div className="relative mx-auto max-w-[82rem]">
        <div className="relative -mt-16 grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(20,52,100,0.16)] md:-mt-24 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[26rem] overflow-hidden bg-[#e7f4ff] sm:min-h-[32rem] lg:min-h-full">
            <div className="absolute -left-12 -top-16 size-64 rounded-full bg-sky/35" aria-hidden="true" />
            <Image
              src="/images/landing/generated-v3/gami-bridge-transparent.webp"
              alt={t('crisisImageAlt')}
              width={1024}
              height={1536}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="relative mx-auto h-full max-h-[38rem] w-auto max-w-full object-contain object-bottom"
            />
            <span className="absolute bottom-7 left-7 rounded-full bg-[#c8102e] px-4 py-2 text-[0.67rem] font-extrabold tracking-[0.12em] text-white uppercase shadow-lg">{t('crisisKicker')}</span>
          </div>
          <div className="relative p-7 sm:p-10 lg:p-14">
            <p className="text-label text-[#c8102e]">01 / {t('crisisKicker')}</p>
            <h2 className="marketing-display mt-4 max-w-3xl text-4xl text-navy md:text-6xl">{t('crisisTitle')}</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-navy/65">{t('crisisSubtitle')}</p>
            <Link href={ROUTES.DAMPAK} className="mt-6 inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-[#c8102e] hover:text-[#c8102e] focus-visible:ring-2 focus-visible:ring-sky">
              {t('impactLink')} <ArrowUpRight className="size-4" />
            </Link>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <article key={stat.labelKey} className={`rounded-2xl p-5 ${index === 0 ? 'bg-[#c8102e] text-white' : 'bg-[#eff7fd] text-navy'}`}>
                  <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className={`mt-2 text-xs leading-5 ${index === 0 ? 'text-white/80' : 'text-navy/65'}`}>{t(stat.labelKey)}</p>
                  <p className={`mt-3 text-[0.62rem] font-bold tracking-[0.1em] uppercase ${index === 0 ? 'text-white/60' : 'text-navy/40'}`}>{t(stat.sourceKey)}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-label text-[#c8102e]">02 / {t('problemKicker')}</p>
            <h2 className="marketing-display mt-4 text-4xl text-navy md:text-6xl">{t('problemTitle')}</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-navy/65">{t('problemBody')}</p>
            <p className="mt-5 text-xs font-bold tracking-wide text-navy/40">{t('crisisStat4Label')} · {t('crisisStat4Source')}</p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-[0_20px_50px_rgba(20,52,100,0.12)] sm:p-7">
            <Image src="/images/landing/generated-v3/problem-props.webp" alt="" aria-hidden width={1774} height={887} sizes="(max-width: 1024px) 100vw, 56vw" className="w-full rounded-2xl object-cover" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PROBLEMS.map(({ key, icon: Icon }, index) => (
                <div key={key} className="rounded-2xl bg-[#f4faff] p-4">
                  <span className={`flex size-9 items-center justify-center rounded-xl ${index === 1 ? 'bg-sky text-navy' : 'bg-navy text-white'}`}><Icon className="size-4" /></span>
                  <p className="mt-4 text-sm font-bold leading-5 text-navy">{t(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 border-y border-navy/10 py-8">
          <p className="text-label mb-6 text-center text-navy/45">{t('supportersLabel')}</p>
          <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {SUPPORTERS.map((supporter) => (
              <div key={supporter.name} className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
                <Image src={supporter.src} alt={`Logo ${supporter.name}`} width={42} height={42} className="size-9 shrink-0 object-contain" />
                <span className="text-xs font-bold leading-tight text-navy/65">{supporter.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-20 left-[-10%] h-44 w-[120%] rounded-[50%] bg-white" aria-hidden="true" />
      <Compass className="pointer-events-none absolute right-[10%] top-[44%] size-16 rotate-12 text-sky/30" aria-hidden="true" />
    </section>
  );
}
