'use client';

import Image from 'next/image';
import { BookOpenCheck, NotebookPen, SmilePlus, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ITEMS = [
  { icon: SmilePlus, title: 'psychoItem1Title', body: 'psychoItem1Body', tone: 'bg-sky' },
  { icon: Target, title: 'psychoItem2Title', body: 'psychoItem2Body', tone: 'bg-[#c8102e] text-white' },
  { icon: NotebookPen, title: 'psychoItem3Title', body: 'psychoItem3Body', tone: 'bg-navy text-white' },
] as const;

export function PsychoeducationSection() {
  const t = useTranslations('LandingPage');

  return (
    <section className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[32rem] rounded-full bg-[#e2f3ff]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[82rem] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto min-h-[32rem] w-full max-w-lg overflow-hidden rounded-[2.25rem] bg-[#eef8ff] shadow-[0_22px_55px_rgba(20,52,100,0.15)]">
          <span className="absolute left-7 top-7 rounded-full bg-navy px-4 py-2 text-[0.65rem] font-extrabold tracking-[0.12em] text-white uppercase">{t('psychoKicker')}</span>
          <Image src="/images/landing/generated-v3/gami-journey-transparent.webp" alt={t('psychoImageAlt')} width={1122} height={1402} sizes="(max-width: 1024px) 100vw, 40vw" className="absolute bottom-0 left-1/2 h-[94%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom" />
          <span className="absolute bottom-7 left-7 rounded-2xl bg-white px-4 py-3 text-xs font-bold leading-5 text-navy shadow-lg">{t('psychoGamiAlt')}</span>
        </div>
        <div>
          <p className="text-label text-[#c8102e]">07 / {t('psychoKicker')}</p>
          <h2 className="marketing-display mt-4 max-w-3xl text-4xl text-navy md:text-6xl">{t('psychoTitle')}</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-navy/65">{t('psychoBody')}</p>
          <div className="mt-9 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {ITEMS.map(({ icon: Icon, title, body, tone }, index) => (
              <article key={title} className={`group relative overflow-hidden rounded-[1.6rem] p-5 transition-transform hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none ${tone} ${index === 0 ? 'text-navy' : ''}`}>
                <div className="flex items-start gap-4">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${index === 0 ? 'bg-navy text-white' : 'bg-white/15 text-white'}`}><Icon className="size-5" /></span>
                  <div>
                    <h3 className="text-lg font-extrabold">{t(title)}</h3>
                    <p className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-navy/70' : 'text-white/75'}`}>{t(body)}</p>
                  </div>
                </div>
                <span className={`absolute -bottom-6 -right-2 text-7xl font-black ${index === 0 ? 'text-navy/10' : 'text-white/10'}`}>0{index + 1}</span>
              </article>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-navy/10 bg-[#f4faff] px-5 py-3 text-sm font-bold text-navy"><BookOpenCheck className="size-5 text-[#c8102e]" />{t('trustPattern')}</div>
        </div>
      </div>
    </section>
  );
}
