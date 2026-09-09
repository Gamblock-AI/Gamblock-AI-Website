import { ArrowRight, BookOpenCheck, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { SectionTransition } from '@/components/landing/SectionTransition';

const METRICS = [
  ['techMetric1Value', 'techMetric1Label'],
  ['techMetric2Value', 'techMetric2Label'],
  ['techMetric3Value', 'techMetric3Label'],
  ['techMetric4Value', 'techMetric4Label'],
] as const;

const RECOVERY_ITEMS = [
  { title: 'psychoItem1Title', body: 'psychoItem1Body', tone: 'bg-sky text-navy' },
  { title: 'psychoItem2Title', body: 'psychoItem2Body', tone: 'bg-[#c8102e] text-white' },
  { title: 'psychoItem3Title', body: 'psychoItem3Body', tone: 'bg-navy text-white' },
] as const;

export function TechnologySection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="teknologi" className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <SectionTransition tone="pale-to-light" />
      <div className="pointer-events-none absolute -right-40 top-12 size-[34rem] rounded-full bg-[#e2f3ff]" aria-hidden="true" />
      <div className="marketing-dot-field pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/3 opacity-45" aria-hidden="true" />
      <SectionDecoration className="left-[8%] top-28" tone="pink" size="md" />
      <SectionDecoration className="right-[10%] bottom-24 -rotate-12" tone="sky" />

      <div className="relative z-10 mx-auto max-w-[82rem]">
        <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="text-label text-[#c8102e]">05 / {t('techKicker')}</p>
            <h2 className="marketing-display mt-4 max-w-3xl text-4xl text-navy md:text-6xl">{t('techTitle')}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-2xl text-base font-medium leading-7 text-navy/75">{t('techSubtitle')}</p>
            <Link href={ROUTES.TECHNOLOGY} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-bold text-navy outline-none transition-colors hover:border-[#c8102e] hover:text-[#c8102e] focus-visible:ring-2 focus-visible:ring-sky">
              {t('snapshotLink')}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {METRICS.map(([value, label], index) => (
            <Reveal key={label} delay={index * 0.05}>
              <div className={`h-full rounded-[1.5rem] border p-5 ${index === 3 ? 'border-navy bg-navy text-white' : 'border-navy/10 bg-[#f4faff] text-navy'}`}>
                <p className={`text-2xl font-extrabold tracking-tight md:text-3xl ${index === 3 ? 'text-sky' : index === 1 ? 'text-[#c8102e]' : ''}`}>{t(value)}</p>
                <p className={`mt-2 text-xs font-semibold leading-5 ${index === 3 ? 'text-white/65' : 'text-navy/55'}`}>{t(label)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Reveal className="relative overflow-hidden rounded-[2.25rem] bg-[#0b1730] p-7 text-white shadow-[0_28px_65px_-32px_rgba(11,23,48,0.65)] sm:p-9">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border-[1.5rem] border-sky/10" aria-hidden="true" />
            <p className="text-label relative mt-8 text-sky">{t('localProcessingLabel')}</p>
            <h3 className="relative mt-3 text-2xl font-extrabold leading-tight">{t('techCard1Title')}</h3>
            <p className="relative mt-4 text-sm font-medium leading-7 text-white/75">{t('techCard1Body')}</p>
            <ul className="relative mt-6 space-y-3 text-sm text-white/80">
              {[t('trustOnDevice'), t('trustEdge'), t('trustPdp')].map((item) => (
                <li key={item} className="flex items-center gap-3"><Check className="size-4 shrink-0 text-sky" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="relative overflow-hidden rounded-[2.25rem] border border-navy/10 bg-[#eef8ff] p-7 shadow-soft sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-sky/20" aria-hidden="true" />
            <p className="text-label relative mt-8 text-[#c8102e]">{t('accountDataLabel')}</p>
            <h3 className="relative mt-3 text-2xl font-extrabold leading-tight text-navy">{t('techCard2Title')}</h3>
            <p className="relative mt-4 text-sm font-medium leading-7 text-navy/75">{t('techCard2Body')}</p>
            <div className="relative mt-7 rounded-2xl border border-navy/10 bg-white/75 p-4 text-sm font-bold leading-6 text-navy">
              {t('trustLabel')}
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <p className="text-label text-[#c8102e]">06 / {t('psychoKicker')}</p>
            <h3 className="marketing-display mt-4 text-4xl text-navy md:text-5xl">{t('psychoTitle')}</h3>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-navy/75">{t('psychoBody')}</p>
            <span className="mt-7 inline-flex items-center gap-3 rounded-full border border-navy/10 bg-[#f4faff] px-5 py-3 text-sm font-bold text-navy">
              <BookOpenCheck className="size-5 text-[#c8102e]" aria-hidden="true" />{t('trustPattern')}
            </span>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {RECOVERY_ITEMS.map(({ title, body, tone }, index) => (
              <Reveal key={title} delay={index * 0.06} y={28}>
                <article className={`relative h-full min-h-60 overflow-hidden rounded-[1.7rem] p-5 ${tone}`}>
                  <h4 className="mt-6 text-lg font-extrabold leading-tight">{t(title)}</h4>
                  <p className={`mt-3 text-sm font-medium leading-6 ${index === 0 ? 'text-navy/75' : 'text-white/80'}`}>{t(body)}</p>
                  <span className="pointer-events-none absolute -bottom-5 -right-1 text-7xl font-black opacity-20" aria-hidden="true">0{index + 1}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
