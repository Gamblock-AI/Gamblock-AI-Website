'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, TrendingDown, Activity, Shield, Heart, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import { Reveal } from '@/components/marketing/Reveal';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ScrollFrameSequence } from '@/components/marketing/ScrollFrameSequence';
import { useTranslations } from "next-intl";

const FRAME_COUNT = 120;
const frameSrc = (i: number) => `/maskot-sequence/frame_${i.toString().padStart(4, '0')}.webp`;

const CRISIS = [
  { stat: 'Rp286T', label: 'perputaran dana judi online sepanjang 2025', source: 'PPATK, 2026', accent: 'text-crimson' },
  { stat: '12,3 jt', label: 'orang tercatat melakukan deposit judi online', source: 'PPATK, 2026', accent: 'text-amber-light' },
  { stat: '5,5 jt+', label: 'konten judi online ditangani sejak 2017', source: 'Kemkomdigi, 2025', accent: 'text-crimson' },
];

const DEMOGRAPHICS = [
  { stat: '440 rb', label: 'pemain usia 10-20 tahun', note: 'generasi paling rentan terdampak' },
  { stat: '520 rb', label: 'pemain usia 21-30 tahun', note: 'kelompok mahasiswa & awal karier' },
];

const INTERVENTION = [
  { icon: TrendingDown, value: '-68%', label: 'penurunan dorongan impulsif saat friction aktif' },
  { icon: Activity, value: '5-10 dtk', label: 'durasi animasi pattern interrupt' },
  { icon: Shield, value: '99,8%', label: 'akurasi klasifikasi hybrid rule + ml' },
  { icon: Heart, value: '<200ms', label: 'latensi pemblokiran di perangkat' },
];

const RECOVERY_ARC = [
  { n: '01', t: 'momen kritis', d: 'dorongan muncul, pengguna mengakses situs judi.' },
  { n: '02', t: 'pattern interrupt', d: 'animasi visual 5 hingga 10 detik memutus respons impulsif.' },
  { n: '03', t: 'pengalihan', d: 'diarahkan ke modul psikoedukasi berbasis self-regulation theory.' },
  { n: '04', t: 'pemulihan mandiri', d: 'mood tracker, misi harian, dan jurnal refleksi membangun kendali diri.' },
];

export function DampakContent() {
    const t = useTranslations('DampakContent');
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 120]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  return (
    <div className="bg-black text-white">
      {/* CRISIS HERO - parallax, single eyebrow */}
      <section ref={heroRef} className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-crimson/15 via-black to-black" />
        <div className="pointer-events-none absolute inset-0 bg-dot-subtle-dark opacity-30" />

        <MarketingNav />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6 pt-28 md:px-10"
        >
          <Reveal className="max-w-3xl space-y-6">
            <span className="inline-block rounded-full border border-crimson/30 bg-crimson/10 px-4 py-1.5 text-xs font-bold tracking-widest text-crimson uppercase">
              {t('text_21')}</span>
            <h1 className="text-[11vw] font-bold leading-[0.95] tracking-tighter text-white md:text-7xl">
              {t('text_22')}<br />
              <span className="text-crimson">{t('text_23')}</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              {t('text_24')}</p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {CRISIS.map((c, i) => (
              <Reveal
                key={c.label}
                delay={i * 0.1}
                className="rounded-3xl border border-white/10 bg-black/60 p-7 backdrop-blur-xl"
              >
                <div className={`text-4xl font-extrabold tracking-tighter md:text-5xl ${c.accent}`}>
                  {c.stat}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{c.label}</p>
                <p className="mt-3 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                  {c.source}
                </p>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </section>

      {/* DEMOGRAPHICS + IMAGE SEQUENCE */}
      <section className="relative w-full bg-black">
        <ScrollFrameSequence
          frameCount={FRAME_COUNT}
          getFrameSrc={frameSrc}
          alignX={0.2}
          className="h-[220dvh]"
          backgroundClassName="bg-black"
        />

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="flex h-[110dvh] items-center justify-end px-6 md:px-16 lg:px-24">
            <Reveal className="pointer-events-auto w-full max-w-[560px] space-y-6 rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl shadow-2xl md:p-10">
              <h2 className="text-3xl font-bold leading-[1.08] tracking-tighter text-white md:text-4xl">
                {t('text_25')}</h2>
              <p className="text-sm leading-relaxed text-white/65 md:text-base">
                {t('text_26')}</p>
              <div className="grid gap-4 pt-2">
                {DEMOGRAPHICS.map((d) => (
                  <div key={d.label} className="flex items-end justify-between border-l-2 border-crimson/50 pl-4">
                    <div>
                      <p className="text-2xl font-bold text-white md:text-3xl">{d.stat}</p>
                      <p className="mt-1 text-xs text-white/55">{d.label}</p>
                    </div>
                    <p className="max-w-[10rem] text-right text-[11px] leading-snug text-white/35">{d.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30">{t('text_27')}</p>
            </Reveal>
          </div>

          <div className="flex h-[110dvh] items-center px-6 md:px-16 lg:px-24">
            <Reveal className="pointer-events-auto w-full max-w-[560px] space-y-6 rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl shadow-2xl md:p-10">
              <h2 className="text-3xl font-bold leading-[1.08] tracking-tighter text-white md:text-4xl">
                {t('text_28')}</h2>
              <p className="text-sm leading-relaxed text-white/65 md:text-base">
                {t('text_29')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INTERVENTION METRICS - plain editorial, no cards */}
      <section className="relative z-20 border-t border-white/10 bg-neutral-950 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_30')}</h2>
          </Reveal>
          <div className="divide-y divide-white/10">
            {INTERVENTION.map(({ icon: Icon, value, label }, i) => (
              <Reveal key={label} delay={i * 0.06} className="flex items-center gap-6 py-8">
                <Icon className="h-7 w-7 shrink-0 text-crimson" />
                <span className="w-32 shrink-0 text-3xl font-bold tracking-tighter text-white md:text-4xl">{value}</span>
                <span className="text-sm leading-snug text-white/55">{label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECOVERY ARC - horizontal flow */}
      <section className="relative z-20 border-t border-white/10 bg-black py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_31')}</h2>
          </Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            {RECOVERY_ARC.map(({ n, t, d }, i) => (
              <Reveal
                key={n}
                delay={i * 0.07}
                className="relative flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="font-mono text-xs tracking-widest text-white/30">{n}</span>
                <h3 className="mt-3 text-sm font-bold text-white">{t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{d}</p>
                {i < RECOVERY_ARC.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/20 md:block" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACCOUNTABILITY - split-screen */}
      <section className="relative z-20 border-t border-white/10 bg-neutral-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
            <Reveal className="space-y-5">
              <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
                {t('text_32')}</h2>
              <p className="text-sm leading-relaxed text-white/60 md:text-base">
                {t('text_33')}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['anti-uninstall', 'verifikasi ganda', 'accessibility api', 'ketahanan jangka panjang'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white/60 uppercase">
                    <Users className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-black/60 p-8 backdrop-blur-xl md:p-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-crimson/15 text-crimson">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('text_34')}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {t('text_35')}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                <div>
                  <div className="text-xl font-bold text-crimson">4</div>
                  <div className="mt-1 text-[10px] text-white/45">{t('text_36')}</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-sage-light">100%</div>
                  <div className="mt-1 text-[10px] text-white/45">{t('text_37')}</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-navy-light">multi</div>
                  <div className="mt-1 text-[10px] text-white/45">{t('text_38')}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA - single intent */}
      <section className="relative z-20 border-t border-white/10 bg-black py-24">
        <Reveal className="mx-auto max-w-3xl space-y-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white md:text-5xl">
            {t('text_39')}<br />
            <span className="text-crimson">{t('text_40')}</span>
          </h2>
          <p className="text-base text-white/65 md:text-lg">
            {t('text_41')}</p>
          <Link href={ROUTES.REGISTER}>
            <Button variant="accent" className="rounded-full bg-crimson px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light">
              {t('text_42')}<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
