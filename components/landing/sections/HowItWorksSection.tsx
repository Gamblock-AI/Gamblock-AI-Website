'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const STEPS = [
  { title: 'howStep1Title', body: 'howStep1Body' },
  { title: 'howStep2Title', body: 'howStep2Body' },
  { title: 'howStep3Title', body: 'howStep3Body' },
] as const;

export function HowItWorksSection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="cara-kerja" className="relative overflow-hidden bg-[#f4faff] px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <div className="pointer-events-none absolute -left-28 top-28 size-[28rem] rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-[82rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-label text-[#c8102e]">04 / {t('howKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl text-navy md:text-6xl">{t('howTitle')}</h2>
        </div>
        <div className="relative mt-12 grid items-center gap-9 lg:grid-cols-[0.85fr_0.95fr_0.85fr]">
          <ol className="grid gap-5 lg:order-1">
            {STEPS.slice(0, 2).map(({ title, body }, index) => (
              <li key={title} className={`relative rounded-[1.7rem] bg-white p-6 shadow-[0_16px_40px_rgba(20,52,100,0.11)] ${index === 1 ? 'lg:ml-10' : ''}`}>
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
                  <span className="absolute -right-14 -top-14 size-48 rounded-full border-[1.35rem] border-sky/15" />
                  <span className="absolute right-14 top-10 size-2 rounded-full bg-[#c8102e]/25" />
                </span>
                <span className="absolute -left-3 -top-3 z-20 flex size-10 items-center justify-center rounded-full bg-[#c8102e] text-sm font-extrabold text-white shadow-lg">0{index + 1}</span>
                <div className="relative z-10 pt-1">
                  <h3 className="text-xl font-extrabold text-navy">{t(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-navy/65">{t(body)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="relative mx-auto flex min-h-[29rem] w-full max-w-sm items-end justify-center overflow-hidden rounded-[2.25rem] border border-white bg-white shadow-[0_20px_55px_rgba(20,52,100,0.16)]">
            <div className="absolute inset-x-7 bottom-7 h-3 rounded-full bg-sky/35 blur-sm" aria-hidden="true" />
            <Image src="/images/landing/generated-v3/gami-journey-transparent.webp" alt={t('howImageAlt')} width={1122} height={1402} sizes="(max-width: 1024px) 80vw, 28vw" className="relative h-[28rem] w-auto max-w-full object-contain object-bottom" />
          </div>
          <ol start={3} className="lg:order-3">
            {STEPS.slice(2).map(({ title, body }) => (
              <li key={title} className="relative rounded-[1.7rem] bg-navy p-6 text-white shadow-[0_16px_40px_rgba(20,52,100,0.2)] lg:-ml-10">
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
                  <span className="absolute -right-14 -top-14 size-48 rounded-full border-[1.35rem] border-sky/20" />
                  <span className="absolute right-14 top-10 size-2 rounded-full bg-sky/60" />
                </span>
                <span className="absolute -right-3 -top-3 z-20 flex size-10 items-center justify-center rounded-full bg-sky text-sm font-extrabold text-navy shadow-lg">03</span>
                <div className="relative z-10 pt-1">
                  <h3 className="text-xl font-extrabold">{t(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{t(body)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="pointer-events-none absolute left-[23%] right-[23%] top-1/2 -z-10 hidden border-t-2 border-dashed border-sky/55 lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
