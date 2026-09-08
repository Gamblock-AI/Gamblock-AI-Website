'use client';

import Image from 'next/image';
import { Check, HeartHandshake, HeartPulse, ScanSearch, Sparkles } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

const FEATURES = [
  { icon: ScanSearch, kicker: 'f1Kicker', title: 'f1Title', body: 'f1Body', bullets: ['f1Bullet1', 'f1Bullet2', 'f1Bullet3'] },
  { icon: Sparkles, kicker: 'f2Kicker', title: 'f2Title', body: 'f2Body', bullets: ['f2Bullet1', 'f2Bullet2', 'f2Bullet3'] },
  { icon: HeartHandshake, kicker: 'f3Kicker', title: 'f3Title', body: 'f3Body', bullets: ['f3Bullet1', 'f3Bullet2', 'f3Bullet3'] },
  { icon: HeartPulse, kicker: 'f4Kicker', title: 'f4Title', body: 'f4Body', bullets: ['f4Bullet1', 'f4Bullet2', 'f4Bullet3'] },
] as const;

export function FeaturesSection() {
  const t = useTranslations('LandingPage');
  const [active, setActive] = useState(0);
  const current = FEATURES[active];

  const onTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? FEATURES.length - 1 : (active + (event.key === 'ArrowDown' ? 1 : -1) + FEATURES.length) % FEATURES.length;
    setActive(next);
    document.getElementById(`support-tab-${next}`)?.focus();
  };

  return (
    <section id="fitur" className="relative isolate overflow-hidden bg-[#0b1730] px-4 py-24 text-white sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute -left-28 top-1/3 size-[28rem] rounded-full bg-[#1d5f9b]/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-10rem] top-[-6rem] size-[32rem] rounded-full border border-sky/15" aria-hidden="true" />
      <div className="relative mx-auto max-w-[82rem]">
        <div className="max-w-3xl">
          <p className="text-label text-sky">03 / {t('featuresKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl md:text-6xl">{t('featuresTitle')}</h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">{t('featuresSubtitle')}</p>
        </div>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[0.74fr_1.26fr]">
          <div role="tablist" aria-label={t('featuresKicker')} aria-orientation="vertical" onKeyDown={onTabsKeyDown} className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const selected = active === index;
              return (
                <button
                  key={feature.kicker}
                  id={`support-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="support-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-sky motion-reduce:transition-none ${selected ? 'border-sky bg-sky text-navy shadow-[0_12px_0_rgba(61,214,245,0.16)]' : 'border-white/12 bg-white/[0.05] text-white hover:border-white/30 hover:bg-white/[0.09]'}`}
                >
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-navy text-white' : 'bg-white/10 text-sky'}`}><Icon className="size-5" /></span>
                  <span>
                    <span className={`block text-[0.65rem] font-extrabold tracking-[0.14em] uppercase ${selected ? 'text-navy/55' : 'text-white/45'}`}>0{index + 1}</span>
                    <span className="mt-1 block text-sm font-extrabold leading-tight">{t(feature.kicker)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <article id="support-panel" role="tabpanel" aria-labelledby={`support-tab-${active}`} className="relative min-h-[36rem] overflow-hidden rounded-[2.25rem] border border-white/15 bg-[#112754] p-6 shadow-[0_28px_65px_rgba(0,0,0,0.3)] sm:p-9 lg:min-h-[39rem]">
            <div className="absolute -right-14 -top-14 size-64 rounded-full border border-sky/20" aria-hidden="true" />
            <div className="relative z-10 max-w-[55%] sm:max-w-[50%]">
              <p className="text-label text-sky">{t(current.kicker)}</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">{t(current.title)}</h3>
              <p className="mt-4 text-sm leading-6 text-white/65 md:text-base md:leading-7">{t(current.body)}</p>
              <ul className="mt-6 space-y-3">
                {current.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm leading-5 text-white/85"><Check className="mt-0.5 size-4 shrink-0 text-sky" />{t(bullet)}</li>
                ))}
              </ul>
            </div>
            <Image src="/images/landing/generated-v3/gami-support-transparent.webp" alt={t('f1Alt')} width={1024} height={1536} sizes="(max-width: 640px) 68vw, (max-width: 1024px) 46vw, 38vw" className="pointer-events-none absolute bottom-[-1.5rem] right-[-4rem] h-[82%] w-auto max-w-[68%] object-contain object-bottom drop-shadow-[0_24px_30px_rgba(0,0,0,0.32)] sm:right-0 sm:max-w-[54%]" />
          </article>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-20 bg-[#f4faff] [clip-path:ellipse(70%_100%_at_50%_100%)]" aria-hidden="true" />
    </section>
  );
}
