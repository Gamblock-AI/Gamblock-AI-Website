'use client';

import Image from 'next/image';
import { SmilePlus, Target, NotebookPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * PsychoeducationSection — preview of the self-regulation recovery hub
 * (mood tracker, daily missions, encrypted journal) beside a phone mockup.
 */
export function PsychoeducationSection() {
  const t = useTranslations('LandingPage');

  const items = [
    { icon: SmilePlus, titleKey: 'psychoItem1Title', bodyKey: 'psychoItem1Body' },
    { icon: Target, titleKey: 'psychoItem2Title', bodyKey: 'psychoItem2Body' },
    { icon: NotebookPen, titleKey: 'psychoItem3Title', bodyKey: 'psychoItem3Body' },
  ] as const;

  return (
    <Section tone="pastel">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal delay={0.05} className="order-1 flex justify-center md:order-1">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-sky-light/50 blur-3xl" aria-hidden />
            <Image
              src="/images/phone-mockup.webp"
              alt="Pratinjau aplikasi ruang pemulihan Gamblock-AI"
              width={360}
              height={720}
              className="w-56 select-none drop-shadow-[0_30px_60px_rgba(22,41,76,0.25)] md:w-72"
            />
          </div>
        </Reveal>

        <div className="order-2 md:order-2">
          <Reveal>
            <Pill variant="navy" className="mb-4">
              {t('psychoKicker')}
            </Pill>
            <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('psychoTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t('psychoBody')}
            </p>
          </Reveal>
          <div className="mt-8 space-y-4">
            {items.map(({ icon: Icon, titleKey, bodyKey }, i) => (
              <Reveal key={titleKey} delay={0.1 + i * 0.06}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/10">
                    <Icon className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">{t(titleKey)}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t(bodyKey)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
