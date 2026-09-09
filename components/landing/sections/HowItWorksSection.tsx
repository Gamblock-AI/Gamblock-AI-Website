import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { SectionTransition } from '@/components/landing/SectionTransition';

const STEPS = [
  { title: 'howStep1Title', body: 'howStep1Body', tone: 'bg-white text-navy' },
  { title: 'howStep2Title', body: 'howStep2Body', tone: 'bg-sky text-navy' },
  { title: 'howStep3Title', body: 'howStep3Body', tone: 'bg-navy text-white' },
] as const;

export function HowItWorksSection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="cara-kerja" className="relative overflow-hidden bg-[#f4faff] px-4 py-28 sm:px-6 md:px-10 md:py-36">
      <SectionTransition tone="team-to-pale" />
      <div className="pointer-events-none absolute -left-40 top-20 size-[32rem] rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
      <SectionDecoration className="right-[7%] top-28" tone="pink" />
      <SectionDecoration className="bottom-28 left-[8%] -rotate-12" tone="sky" size="md" />

      <div className="relative z-10 mx-auto max-w-[82rem]">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-label text-[#c8102e]">04 / {t('howKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl text-navy md:text-6xl">{t('howTitle')}</h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[15%] right-[15%] top-16 hidden border-t-2 border-dashed border-navy/15 lg:block" aria-hidden="true" />
          {STEPS.map(({ title, body, tone }, index) => (
            <li key={title} className="relative">
              <Reveal delay={index * 0.08} y={34} className="h-full">
                <article className={`relative h-full min-h-72 overflow-hidden rounded-[2rem] border border-white p-7 shadow-[0_22px_55px_-32px_rgba(22,41,76,0.4)] ${tone}`}>
                  <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full border-[1.25rem] border-current opacity-10" aria-hidden="true" />
                  <div className="relative flex items-center justify-between">
                    <span className={`flex size-11 items-center justify-center rounded-full text-sm font-black ${index === 0 ? 'bg-[#c8102e] text-white' : index === 1 ? 'bg-white text-navy' : 'bg-[#c8102e] text-white'}`}>0{index + 1}</span>
                  </div>
                  <h3 className="relative mt-8 text-2xl font-extrabold leading-tight tracking-tight">{t(title)}</h3>
                  <p className={`relative mt-4 text-sm font-medium leading-7 ${index === 2 ? 'text-white/80' : 'text-navy/75'}`}>{t(body)}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-navy/10 bg-white p-6 shadow-soft sm:flex-row sm:items-center">
          <div>
            <p className="text-label text-[#c8102e]">{t('platformKicker')}</p>
            <p className="mt-2 max-w-2xl text-lg font-extrabold leading-tight text-navy">{t('platformTitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-azure px-4 text-sm font-bold text-navy"><Smartphone className="size-4" aria-hidden="true" />{t('platformAndroid')}</span>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-azure px-4 text-sm font-bold text-navy"><Monitor className="size-4" aria-hidden="true" />{t('platformWindows')}</span>
            <Link href={ROUTES.DOWNLOAD} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c8102e] px-5 text-sm font-bold text-white outline-none transition-colors hover:bg-[#da1c3a] focus-visible:ring-2 focus-visible:ring-[#c8102e]/40 focus-visible:ring-offset-2">
              {t('linkDownload')}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
