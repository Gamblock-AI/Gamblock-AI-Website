'use client';

import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';

/**
 * TeamSection — academic credibility: the cross-disciplinary PKM-KC team.
 * Photo-forward layout: each member and the advisor lead with a large portrait.
 * Photos use placeholders for now.
 */
export function TeamSection() {
  const t = useTranslations('LandingPage');

  const members = [
    {
      name: 'Alfian Gading Saputra',
      photo: '/images/team/member-1.jpg',
      roleKey: 'teamMember1Role',
      taskKey: 'teamMember1Task',
    },
    {
      name: 'Dery Wahyu Perdana',
      photo: '/images/team/member-2.jpg',
      roleKey: 'teamMember2Role',
      taskKey: 'teamMember2Task',
    },
    {
      name: 'Nasywa Nurhaliza Prasetyo',
      photo: '/images/team/member-3.jpg',
      roleKey: 'teamMember3Role',
      taskKey: 'teamMember3Task',
    },
    {
      name: 'Suci Maisaa',
      photo: '/images/team/member-4.jpg',
      roleKey: 'teamMember4Role',
      taskKey: 'teamMember4Task',
    },
  ] as const;

  const advisorName = 'Moh. Ali Romli, S.Kom., M.Kom.';

  const stats = [
    { valueKey: 'teamStat1Value', labelKey: 'teamStat1Label' },
    { valueKey: 'teamStat2Value', labelKey: 'teamStat2Label' },
    { valueKey: 'teamStat3Value', labelKey: 'teamStat3Label' },
  ] as const;

  return (
    <Section id="tim" tone="dots">
      {/* Intro */}
      <Reveal className="mx-auto max-w-2xl text-center">
        <Pill variant="navy" className="mb-4">
          <GraduationCap className="h-3.5 w-3.5" />
          {t('teamKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('teamTitle')}</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t('teamBody')}</p>
      </Reveal>

      {/* Stats */}
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-3">
        {stats.map((s) => (
          <div
            key={s.labelKey}
            className="flex flex-col items-center rounded-2xl border border-border bg-card px-2 py-4 text-center shadow-soft sm:px-4"
          >
            <p className="text-base font-extrabold leading-tight tracking-tight text-crimson sm:text-xl">
              {t(s.valueKey)}
            </p>
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
              {t(s.labelKey)}
            </p>
          </div>
        ))}
      </div>

      {/* Advisor — featured, same photo treatment as member cards */}
      <Reveal className="mx-auto mt-14 max-w-3xl">
        <div className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-card sm:grid-cols-[minmax(0,16rem)_1fr]">
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:h-full">
            <Image
              src="/images/team/advisor.jpg"
              alt={`Foto ${advisorName}`}
              fill
              sizes="(max-width: 640px) 100vw, 16rem"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-7">
            <Pill variant="navy" className="mb-3 w-fit">
              <GraduationCap className="h-3.5 w-3.5" />
              {t('teamAdvisorRole')}
            </Pill>
            <h3 className="text-heading text-xl text-navy md:text-2xl">{advisorName}</h3>
            <p className="mt-1 text-sm font-semibold text-navy/60">
              Universitas Teknologi Yogyakarta
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('teamAdvisorTask')}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Members — compact photo cards (equal height) */}
      <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map(({ name, photo, roleKey, taskKey }, i) => (
          <Reveal key={name} delay={i * 0.06} className="h-full">
            <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card">
              {/* Compact portrait */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={photo}
                  alt={`Foto ${name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold leading-tight text-navy">{name}</h3>
                <p className="text-label mt-1.5 text-crimson">{t(roleKey)}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(taskKey)}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
