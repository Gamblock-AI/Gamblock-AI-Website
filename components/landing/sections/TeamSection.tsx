'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const MEMBERS = [
  { name: 'Alfian Gading Saputra', photo: '/images/team/member-1.webp', role: 'teamMember1Role', task: 'teamMember1Task' },
  { name: 'Dery Wahyu Perdana', photo: '/images/team/member-2.webp', role: 'teamMember2Role', task: 'teamMember2Task' },
  { name: 'Nasywa Nurhaliza Prasetyo', photo: '/images/team/member-3.webp', role: 'teamMember3Role', task: 'teamMember3Task' },
  { name: 'Suci Maisaa', photo: '/images/team/member-4.webp', role: 'teamMember4Role', task: 'teamMember4Task' },
] as const;

const STATS = [
  { value: 'teamStat1Value', label: 'teamStat1Label' },
  { value: 'teamStat2Value', label: 'teamStat2Label' },
  { value: 'teamStat3Value', label: 'teamStat3Label' },
] as const;

export function TeamSection() {
  const t = useTranslations('LandingPage');

  return (
    <section id="tim" className="relative overflow-hidden bg-[#e8f5ff] px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute left-[8%] top-28 size-20 rounded-full border-[10px] border-[#c8102e]/20" aria-hidden="true" />
      <div className="relative mx-auto max-w-[82rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-label text-[#c8102e]">08 / {t('teamKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl text-navy md:text-5xl">{t('teamTitle')}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-navy/65">{t('teamBody')}</p>
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-[0_10px_24px_rgba(20,52,100,0.1)]">
                <p className="text-lg font-extrabold tracking-tight text-[#c8102e]">{t(value)}</p>
                <p className="mt-1 text-[0.66rem] leading-4 text-navy/60">{t(label)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:h-[34rem] lg:grid-cols-[0.76fr_1.24fr]">
          <article tabIndex={0} className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d9f3ff] via-sky to-[#36c4e7] outline-none transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-navy motion-reduce:transition-none lg:min-h-0">
            <div className="pointer-events-none absolute -left-16 top-24 size-72 rounded-full border-[1.5rem] border-white/30" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-20 bottom-[-5rem] size-72 rounded-full border-[1.5rem] border-navy/10" aria-hidden="true" />
            <Image src="/images/team/advisor-transparent-cropped.webp" alt="Foto Moh. Ali Romli, S.Kom., M.Kom." width={718} height={640} sizes="(max-width: 1024px) 80vw, 33vw" className="absolute bottom-[-0.1rem] left-1/2 h-auto w-[29rem] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_24px_22px_rgba(20,52,100,0.2)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-navy/80 via-navy/35 to-transparent p-6 text-white">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-sky">{t('teamAdvisorRole')}</p>
              <h3 className="mt-2 text-xl font-extrabold leading-tight">Moh. Ali Romli, S.Kom., M.Kom.</h3>
              <p className="mt-1 text-xs font-semibold text-white/70">Universitas Teknologi Yogyakarta</p>
            </div>
            <div className="pointer-events-none absolute inset-0 z-20 flex items-end bg-navy/78 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
              <p className="max-w-sm text-sm leading-6 text-white/85">{t('teamAdvisorTask')}</p>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:h-full lg:grid-rows-2">
          {MEMBERS.map(({ name, photo, role, task }) => (
            <article key={name} tabIndex={0} className="group relative min-h-60 overflow-hidden rounded-[1.6rem] bg-[#eceeff] outline-none transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky motion-reduce:transform-none motion-reduce:transition-none">
              <div className="absolute inset-x-0 bottom-0 top-[4.75rem] overflow-hidden">
                <Image src={photo} alt={`Foto ${name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 31vw" className="origin-top object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-navy/85 via-navy/65 to-transparent p-5 text-white">
                <h3 className="text-base font-extrabold leading-tight">{name}</h3>
                <p className="mt-1 text-[0.68rem] font-extrabold leading-4 uppercase tracking-[0.08em] text-[#9defff] [text-shadow:0_1px_8px_rgba(3,14,35,0.9)]">{t(role)}</p>
              </div>
              <div className="pointer-events-none absolute inset-0 z-20 flex items-end bg-navy/78 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
                <p className="text-sm leading-6 text-white/85">{t(task)}</p>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
