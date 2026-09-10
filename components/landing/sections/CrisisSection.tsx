import Image from 'next/image';
import { ArrowUpRight, RefreshCw, Route, ScanSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { SectionDecoration } from '@/components/landing/SectionDecoration';

const SUPPORTERS = [
  { name: 'Kemdiktisaintek', src: '/images/supporters/kemdiktisaintek-new.png' },
  { name: 'Ditjen Dikti', src: '/images/supporters/ditjen-dikti-new.png' },
  { name: 'Belmawa', src: '/images/supporters/belmawa-new.png' },
  { name: 'Universitas Teknologi Yogyakarta', src: '/images/supporters/uty-new.png' },
  { name: 'PKM Corner UTY', src: '/images/supporters/pkmcorner-uty-new.png' },
] as const;

const PROBLEMS = [
  { key: 'problemPoint1', icon: RefreshCw, iconTone: 'bg-[#fff0f3] text-[#c8102e]' },
  { key: 'problemPoint2', icon: ScanSearch, iconTone: 'bg-[#e3f7ff] text-[#1685a6]' },
  { key: 'problemPoint3', icon: Route, iconTone: 'bg-[#e9eef6] text-navy' },
] as const;

export function CrisisSection() {
  const t = useTranslations('LandingPage');
  const stats = [
    { value: 'Rp286,84 T', label: 'crisisStat1Label', source: 'crisisStat1Source', tone: 'bg-[#c8102e] text-white' },
    { value: '12,3 juta', label: 'crisisStat2Label', source: 'crisisStat2Source', tone: 'bg-[#eaf7ff] text-navy' },
    { value: '960 ribu', label: 'crisisStat3Label', source: 'crisisStat3Source', tone: 'bg-navy text-white' },
  ] as const;

  return (
    <section id="dampak" className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute -left-32 top-20 size-[28rem] rounded-full bg-sky/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-1/3 size-36 rounded-full border-[1.2rem] border-azure/80" aria-hidden="true" />
      <SectionDecoration className="right-[9%] top-24" tone="pink" />
      <SectionDecoration className="bottom-24 left-[4%] -rotate-12" tone="sky" size="md" />

      <div className="relative z-10 mx-auto max-w-[82rem]">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Reveal>
            <p className="text-label text-[#c8102e]">01 / {t('crisisKicker')}</p>
            <h2 className="marketing-display mt-4 max-w-4xl text-4xl text-navy md:text-6xl">
              {t('crisisTitle')}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-2xl text-base font-medium leading-7 text-navy/75">{t('crisisSubtitle')}</p>
            <Link
              href={ROUTES.DAMPAK}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-bold text-navy outline-none transition-colors hover:border-[#c8102e] hover:text-[#c8102e] focus-visible:ring-2 focus-visible:ring-sky"
            >
              {t('impactLink')}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <article className={`relative h-full overflow-hidden rounded-[1.75rem] p-6 shadow-[0_18px_45px_-24px_rgba(22,41,76,0.35)] ${stat.tone}`}>
                <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border-[0.9rem] border-current opacity-10" aria-hidden="true" />
                <p className="text-3xl font-extrabold tracking-tight md:text-4xl">{stat.value}</p>
                <p className="mt-3 max-w-xs text-sm font-semibold leading-6 opacity-80">{t(stat.label)}</p>
                <p className="mt-5 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] opacity-55">{t(stat.source)}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 rounded-[2.25rem] bg-[#f2f9fe] p-5 shadow-[0_24px_55px_-32px_rgba(22,41,76,0.32)] sm:p-8 lg:grid-cols-[0.86fr_1.14fr] lg:p-10">
          <Reveal>
            <p className="text-label text-[#c8102e]">02 / {t('problemKicker')}</p>
            <h3 className="marketing-display mt-4 text-3xl text-navy md:text-5xl">{t('problemTitle')}</h3>
            <p className="mt-5 text-sm font-medium leading-7 text-navy/75 md:text-base">{t('problemBody')}</p>
            <p className="mt-5 text-[0.68rem] font-bold tracking-wide text-navy/40">
              {t('crisisStat4Label')} · {t('crisisStat4Source')}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="overflow-hidden rounded-[2rem] border border-navy/[0.08] bg-white p-3 shadow-[0_28px_65px_-38px_rgba(22,41,76,0.4)] sm:p-4">
            <Image
              src="/images/landing/generated-v4/problem-static-block-bypass.webp"
              alt=""
              aria-hidden="true"
              width={1774}
              height={887}
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="aspect-[2/1] w-full rounded-[1.5rem] object-cover"
            />
            <ol className="mt-3 grid overflow-hidden rounded-[1.5rem] border border-navy/[0.08] bg-[#f7fbfe] divide-y divide-navy/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {PROBLEMS.map(({ key, icon: Icon, iconTone }, index) => (
                <li key={key} className="flex min-h-36 flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black tracking-[0.16em] text-navy/30" aria-hidden="true">0{index + 1}</span>
                    <span className={`flex size-9 items-center justify-center rounded-xl ${iconTone}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-bold leading-5 text-navy">{t(key)}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal className="mt-16 border-y border-navy/10 py-8">
          <p className="text-label mb-6 text-center text-navy/45">{t('supportersLabel')}</p>
          <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SUPPORTERS.map((supporter) => (
              <div key={supporter.name} className="flex min-h-16 items-center justify-center gap-3 rounded-2xl border border-navy/[0.06] bg-white px-3 py-3 text-center shadow-soft">
                <Image src={supporter.src} alt={`Logo ${supporter.name}`} width={40} height={40} className="size-9 shrink-0 object-contain" />
                <span className="text-xs font-bold leading-tight text-navy/65">{supporter.name}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
