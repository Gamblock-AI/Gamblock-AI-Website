'use client';

import Image from 'next/image';
import { BookOpenCheck, NotebookPen, SmilePlus, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

const ITEMS = [
  { icon: SmilePlus, titleKey: 'psychoItem1Title', bodyKey: 'psychoItem1Body' },
  { icon: Target, titleKey: 'psychoItem2Title', bodyKey: 'psychoItem2Body' },
  { icon: NotebookPen, titleKey: 'psychoItem3Title', bodyKey: 'psychoItem3Body' },
] as const;

export function PsychoeducationSection() {
  const t = useTranslations('LandingPage');

  return (
    <Section tone="pastel" className="py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <Reveal>
            <Pill variant="navy" className="mb-4">
              <BookOpenCheck className="h-3.5 w-3.5" />
              {t('psychoKicker')}
            </Pill>
            <h2 className="max-w-2xl text-heading text-3xl text-navy md:text-5xl">
              {t('psychoTitle')}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              {t('psychoBody')}
            </p>
          </Reveal>

          <div className="mt-8 divide-y divide-navy/8 rounded-[1.75rem] border border-navy/8 bg-white/82 px-5 shadow-soft backdrop-blur sm:px-6">
            {ITEMS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
              <Reveal key={titleKey} delay={0.06 + index * 0.04}>
                <div className="flex items-start gap-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/8 text-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-navy">{t(titleKey)}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(bodyKey)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.08} className="relative">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white bg-white p-3 shadow-[0_28px_70px_rgba(22,41,76,0.16)]">
            <Image
              src="/images/landing/generated/pillar-recovery.webp"
              alt="Mahasiswa menulis jurnal refleksi dalam ruang yang hangat"
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="aspect-[4/3] w-full rounded-[1.7rem] object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-5 flex h-36 w-36 items-end justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-sky-light shadow-card sm:h-44 sm:w-44">
            <Image
              src="/images/landing/generated/gami-reflect.webp"
              alt="Gami duduk tenang untuk menemani refleksi"
              width={1254}
              height={1254}
              sizes="11rem"
              className="h-[95%] w-auto object-contain"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
