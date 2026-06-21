'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Shield,
  Scan,
  Brain,
  Cpu,
  Lock,
  Eye,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Gauge,
  Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import { Reveal } from '@/components/marketing/Reveal';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ScrollFrameSequence } from '@/components/marketing/ScrollFrameSequence';
import { useTranslations } from "next-intl";

const FRAME_COUNT = 120;
const frameSrc = (i: number) => `/maskot-sequence/frame_${i.toString().padStart(4, '0')}.webp`;

const CHAPTERS = [
  {
    kicker: 'deteksi',
    accent: 'text-navy-light',
    chip: 'border-navy/30 bg-navy/10 text-navy-light',
    title: 'hybrid analysis membongkar kamuflase.',
    body: 'rule-based system mengenali pola url eksplisit, sementara logistic regression menganalisis konten halaman. teks dari elemen kunci (title, heading, anchor text) diekstrak dan direpresentasikan sebagai bag-of-words untuk klasifikasi real-time.',
    stat: '99,8%',
    statLabel: 'akurasi klasifikasi hybrid rule + ml',
  },
  {
    kicker: 'komputasi',
    accent: 'text-crimson',
    chip: 'border-crimson/20 bg-crimson/10 text-crimson',
    title: 'on-device ai. privasi mutlak.',
    body: 'seluruh inferensi dijalankan pada prosesor lokal perangkat. tidak ada data penelusuran, tangkapan layar, atau riwayat yang dikirim ke server. arsitektur edge computing ini patuh prinsip minimalisasi data dalam undang-undang perlindungan data pribadi.',
    stat: '<200ms',
    statLabel: 'latensi pemblokiran di perangkat',
  },
  {
    kicker: 'inspeksi',
    accent: 'text-sage-light',
    chip: 'border-sage/30 bg-sage/10 text-sage-light',
    title: 'analisis dom pada momen kritis.',
    body: 'beroperasi sebagai background service: accessibility service di android, system service di windows. memungkinkan inspeksi elemen layar real-time yang tidak bisa dilakukan aplikasi standar. situs judi yang menyamarkan diri di balik konten legal tetap terbongkar sebelum halaman dimuat penuh.',
    stat: '100%',
    statLabel: 'proses lokal, tanpa upload data',
  },
];

const PILLARS = [
  { icon: GitBranch, title: 'rule-based + machine learning', desc: 'dua lapis deteksi: pola alamat eksplisit ditangkap aturan, situs berkamuflase dibongkar model logistic regression berbasis konten.' },
  { icon: Scan, title: 'ekstraksi dom instan', desc: 'menangkap teks tersembunyi, meta tags, dan struktur elemen halaman secara real-time sebelum konten judi sempat ditampilkan.' },
  { icon: Cpu, title: 'lightweight inference', desc: 'logistic regression dipilih karena ringan dengan kompleksitas komputasi rendah. berjalan efisien di latar belakang tanpa membebani perangkat.' },
  { icon: Lock, title: 'edge computing privasi', desc: 'tidak ada data riwayat penelusuran yang dikirim ke server. seluruh komputasi ai berjalan langsung pada prosesor lokal perangkat anda.' },
  { icon: Network, title: 'multi-platform background', desc: 'proteksi menyeluruh pada seluruh aktivitas jaringan, bukan hanya di peramban. berjalan terus di latar belakang android maupun windows.' },
  { icon: Gauge, title: 'metrik terukur', desc: 'dievaluasi dengan precision, recall, dan f1-score dengan fokus minimalisasi false positive agar situs akademik tidak terblokir keliru.' },
];

const PIPELINE = [
  { n: '01', icon: Eye, t: 'akses terdeteksi', d: 'background service mengamati aktivitas jaringan' },
  { n: '02', icon: Scan, t: 'ekstraksi dom', d: 'teks elemen kunci halaman diekstrak' },
  { n: '03', icon: Brain, t: 'vektorisasi bow', d: 'teks direpresentasikan sebagai fitur numerik' },
  { n: '04', icon: GitBranch, t: 'klasifikasi hybrid', d: 'rule + logistic regression menilai' },
  { n: '05', icon: Shield, t: 'blokir & intervensi', d: 'pattern interrupt aktif di bawah 200ms' },
];

export function TechnologyContent() {
    const t = useTranslations('TechnologyContent');
  const reduce = useReducedMotion();

  return (
    <div className="bg-black text-white">
      {/* INTRO - left-aligned, no eyebrow, no scroll cue */}
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2C54]/30 via-black to-black" />
        <div className="pointer-events-none absolute inset-0 bg-dot-subtle-dark opacity-40" />

        <MarketingNav />

        <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6 pt-28 md:px-10">
          <Reveal className="max-w-3xl space-y-6">
            <h1 className="text-[11vw] font-bold leading-[0.95] tracking-tighter text-white md:text-7xl">
              {t('text_43')}<br />
              <span className="text-crimson">{t('text_44')}</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              {t('text_45')}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={ROUTES.REGISTER}>
                <Button variant="accent" className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light">
                  {t('text_46')}<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dampak">
                <Button variant="ghost" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white hover:bg-white/10">
                  {t('text_47')}</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SCROLL-BOUND IMAGE SEQUENCE + CHAPTERS */}
      <section id="pendalaman" className="relative w-full bg-black">
        <ScrollFrameSequence
          frameCount={FRAME_COUNT}
          getFrameSrc={frameSrc}
          alignX={0.82}
          className="h-[300dvh]"
        />

        <div className="pointer-events-none absolute inset-0 z-10 w-full">
          {CHAPTERS.map((c, i) => {
            const right = i % 2 === 1;
            return (
              <div
                key={c.kicker}
                className={`flex h-[100dvh] items-center px-6 md:px-16 lg:px-24 ${right ? 'justify-start' : 'justify-end'}`}
              >
                <Reveal className="pointer-events-auto w-full max-w-[520px] rounded-3xl border border-white/10 bg-black/70 p-8 backdrop-blur-xl shadow-2xl md:p-10">
                  <span className={`inline-block rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase ${c.chip}`}>
                    {c.kicker}
                  </span>
                  <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-tighter text-white md:text-4xl">
                    {c.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/65 md:text-base">{c.body}</p>
                  <div className="mt-6 flex items-end gap-4 border-t border-white/10 pt-5">
                    <span className={`text-4xl font-extrabold tracking-tight ${c.accent}`}>{c.stat}</span>
                    <span className="mb-1 max-w-[14rem] text-xs leading-snug text-white/45">{c.statLabel}</span>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* PILLARS - asymmetric bento with visual variation */}
      <section className="relative z-20 border-t border-white/10 bg-neutral-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_48')}</h2>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, desc }, i) => {
              const featured = i === 0;
              return (
                <Reveal
                  key={title}
                  delay={i * 0.05}
                  className={`group rounded-2xl border p-6 transition-colors ${featured ? 'border-crimson/30 bg-gradient-to-br from-crimson/15 to-transparent md:col-span-2' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-crimson">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PIPELINE - horizontal flow, one row, no equal-card repetition */}
      <section className="relative z-20 border-t border-white/10 bg-black py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_49')}</h2>
          </Reveal>

          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            {PIPELINE.map(({ n, icon: Icon, t, d }, i) => (
              <Reveal
                key={n}
                delay={i * 0.06}
                className="relative flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="font-mono text-xs tracking-widest text-white/30">{n}</span>
                <Icon className="mt-3 h-6 w-6 text-crimson" />
                <h3 className="mt-3 text-sm font-bold text-white">{t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{d}</p>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/20 md:block" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-20 border-t border-white/10 bg-neutral-950 py-24">
        <Reveal className="mx-auto max-w-3xl space-y-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white md:text-5xl">
            {t('text_50')}<br />
            <span className="text-crimson">{t('text_51')}</span>
          </h2>
          <p className="text-base text-white/65 md:text-lg">
            {t('text_52')}</p>
          <Link href={ROUTES.REGISTER}>
            <Button variant="accent" className="rounded-full bg-crimson px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light">
              {t('text_53')}<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
