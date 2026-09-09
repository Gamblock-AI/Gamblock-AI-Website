import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { MascotFloat } from '@/components/landing/MascotFloat';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { SectionTransition } from '@/components/landing/SectionTransition';

const FEATURES = [
  { kicker: 'f1Kicker', title: 'f1Title', body: 'f1Body', tone: 'bg-sky text-navy' },
  { kicker: 'f2Kicker', title: 'f2Title', body: 'f2Body', tone: 'bg-white text-navy' },
  { kicker: 'f3Kicker', title: 'f3Title', body: 'f3Body', tone: 'bg-[#dff5ff] text-navy' },
  { kicker: 'f4Kicker', title: 'f4Title', body: 'f4Body', tone: 'bg-[#c8102e] text-white' },
] as const;

export function FeaturesSection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="fitur" className="relative isolate overflow-hidden bg-[#e8f5ff] px-4 py-28 text-navy sm:px-6 md:px-10 md:py-36">
      <SectionTransition tone="light-to-team" />
      <div className="pointer-events-none absolute -left-48 top-1/3 size-[34rem] rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-36 top-20 size-[30rem] rounded-full border border-sky/15" aria-hidden="true" />
      <div className="marketing-dot-field pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-20" aria-hidden="true" />
      <SectionDecoration className="left-[8%] bottom-24" tone="navy" size="md" />
      <SectionDecoration className="right-[10%] top-40 -rotate-12" tone="sky" />

      <div className="relative z-10 mx-auto max-w-[82rem]">
        <Reveal className="max-w-3xl">
          <p className="text-label text-[#c8102e]">03 / {t('featuresKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl md:text-6xl">{t('featuresTitle')}</h2>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-navy/75">{t('featuresSubtitle')}</p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[0.84fr_1.16fr]">
          <Reveal className="relative min-h-[34rem] overflow-hidden rounded-[2.4rem] border border-navy/10 bg-white shadow-[0_24px_60px_rgba(20,52,100,0.14)]" y={38}>
            <MascotFloat
              src="/images/landing/generated-v4/gami-protection-presenter.webp"
              alt={t('f1Alt')}
              width={1000}
              height={1200}
              animate={false}
              parallax={0}
              sizes="(max-width: 1024px) 92vw, 40vw"
              className="h-full"
              imgClassName="h-full min-h-[34rem] w-full object-cover drop-shadow-none"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-navy/10 bg-white/90 p-4 backdrop-blur-md">
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-[#c8102e]">{t('snapshotCardLabel')}</p>
              <p className="mt-2 text-sm font-bold leading-5 text-navy/80">{t('snapshotCardBody')}</p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ kicker, title, body, tone }, index) => (
              <Reveal key={kicker} delay={0.05 * index} y={26}>
                <article className={`group relative h-full min-h-60 overflow-hidden rounded-[1.75rem] border border-navy/10 p-6 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none ${tone}`}>
                  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border-[1rem] border-current opacity-10" aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-4xl font-black opacity-15">0{index + 1}</span>
                    </div>
                    <p className={`mt-7 text-[0.64rem] font-extrabold uppercase tracking-[0.14em] ${index === 3 ? 'text-white/70' : 'text-navy/60'}`}>{t(kicker)}</p>
                    <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-tight">{t(title)}</h3>
                    <p className={`mt-4 text-sm font-medium leading-6 ${index === 3 ? 'text-white/80' : 'text-navy/75'}`}>{t(body)}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
