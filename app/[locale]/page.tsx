'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Shield,
  Brain,
  Users,
  Heart,
  ArrowRight,
  Download,
  Smartphone,
  Monitor,
  Lock,
  GraduationCap,
  Eye,
  Scan,
  Activity,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import MaskotSequence from '@/components/MaskotSequence';
import { Reveal } from '@/components/marketing/Reveal';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { StickyStack } from '@/components/marketing/StickyStack';
import { HorizontalPan } from '@/components/marketing/HorizontalPan';

const CRISIS_CARDS = [
  {
    stat: 'Rp286T',
    label: 'Perputaran dana judi online di Indonesia sepanjang 2025, menghancurkan masa depan generasi muda.',
    note: 'Sumber: PPATK, 2026',
  },
  {
    stat: '12,3 Jt',
    label: 'Individu terjerat, mayoritas mahasiswa dan pelajar yang terjebak utang pinjaman online ilegal.',
    note: 'Sumber: PPATK, 2026',
  },
  {
    stat: '5,5 Jt+',
    label: 'Konten judi online yang diblokir, namun terus bereinkarnasi dengan domain baru setiap detiknya.',
    note: 'Sumber: Kemkomdigi, 2025',
  },
];

const FEATURE_PANELS = [
  {
    icon: Scan,
    kicker: 'Deteksi Pintar (On-Device AI)',
    title: 'Membaca kamuflase situs judi secara real-time, tanpa kompromi privasi.',
    body: 'Pemblokiran DNS konvensional sudah usang. Gamblock menggunakan Hybrid Analysis (Rule-Based + Logistic Regression) untuk mengekstrak struktur DOM (Title, Heading, Anchor) secara diam-diam. Seluruh pemrosesan berjalan 100% lokal di perangkat Anda (Edge Computing), memastikan tidak ada data riwayat penelusuran yang dikirim ke server luar.',
    accent: 'text-navy-light',
  },
  {
    icon: Heart,
    kicker: 'Intervensi (Pattern Interrupt)',
    title: 'Memutus impuls negatif tepat pada detik-detik paling krusial.',
    body: 'Saat situs judi terdeteksi, sistem tidak hanya memblokir, tetapi otomatis menayangkan "Shock Therapy" berupa animasi grafis 5-10 detik. Ini dirancang secara psikologis untuk memutus respons impulsif saat otak sedang mencari dopamin, menahan Anda sebelum tergelincir lebih jauh.',
    accent: 'text-crimson',
  },
  {
    icon: Users,
    kicker: 'Akuntabilitas (Social Protocol)',
    title: 'Perlindungan anti-uninstall. Anda tidak akan bisa menyerah sendirian.',
    body: 'Godaan terbesar adalah menghapus aplikasi pemblokir saat dorongan judi memuncak. Gamblock mengaktifkan Social Accountability Protocol melalui Accessibility Service. Setiap permintaan uninstall harus mendapat persetujuan via WhatsApp dari Pendamping Anda (Dosen/Keluarga). Kami menciptakan "Procedural Friction" yang memaksa Anda berpikir rasional.',
    accent: 'text-sage-light',
  },
  {
    icon: Lock,
    kicker: 'Ruang Pemulihan (Psikoedukasi)',
    title: 'Bukan sekadar memblokir, kami memandu Anda untuk kembali pulih.',
    body: 'Pemblokiran tanpa rehabilitasi hanya akan memicu pencarian proxy/VPN. Gamblock mengarahkan Anda ke Web Psikoedukasi yang berbasis Self-Regulation Theory. Anda dapat melacak emosi harian (Mood Tracker), menyelesaikan Misi Harian, dan menulis Jurnal Refleksi yang diamankan dengan standar Enkripsi AES-256-GCM tingkat militer.',
    accent: 'text-amber',
  },
];

const STEPS = [
  { icon: Download, title: 'Unduh & Tautkan Akun', desc: 'Instal aplikasi ringan di Android/Windows. Masukkan "Group Code" dari Pendamping Anda untuk mengunci perlindungan secara permanen.' },
  { icon: Brain, title: 'Deteksi AI Latar Belakang', desc: 'Sistem berjalan diam-diam (Background Service) dengan RAM <5MB, menyensor struktur halaman web (DOM) tanpa melanggar batasan privasi UU PDP.' },
  { icon: Heart, title: 'Intervensi & Rehabilitasi', desc: 'Sistem menyela aktivitas dengan Pattern Interrupt, memblokir akses secara instan (Offline/Online), dan mengarahkan Anda ke misi regulasi diri.' },
];

const IMPACT = [
  { icon: TrendingDown, value: '-68%', label: 'Penurunan dorongan impulsif saat friction akuntabilitas aktif' },
  { icon: Activity, value: '5-10 Dtk', label: 'Jeda emas Pattern Interrupt untuk merebut kembali akal sehat' },
  { icon: Shield, value: 'AES-256', label: 'Enkripsi militer melindungi setiap kata di jurnal refleksi Anda' },
];

import {useTranslations} from 'next-intl';

export default function LandingPage() {
  const reduce = useReducedMotion();
  const t = useTranslations('LandingPage');

  return (
    <div className="bg-black text-white">
      {/* HERO - video-mask + offset word-type */}
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/videos/hero-bg.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0D2C54]/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <MarketingNav />

        <div className="relative flex min-h-[100dvh] w-full items-center px-6 md:px-10">
          <div className="w-full max-w-3xl pt-24">
            <h1 className="text-[10vw] font-bold leading-[0.95] tracking-tighter text-white md:text-[6rem]">
              {t('title')}
              <br />
              <span className="text-crimson">{t('titleAccent')}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-snug text-white/80 md:text-lg">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="accent"
                  className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light"
                >
                  {t('btnStart')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/technology">
                <Button
                  variant="ghost"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition-colors hover:bg-white/10"
                >
                  {t('btnLearn')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* single corner stat, no scroll cue */}
        <div className="pointer-events-none absolute right-6 bottom-8 z-10 text-right md:right-10 md:bottom-12">
          <span className="text-4xl font-bold tracking-tighter text-white md:text-5xl">
            Rp286<span className="text-crimson">T</span>
          </span>
          <p className="mt-1 max-w-[220px] text-right text-xs leading-snug text-white/50">
            {t('text_0')}</p>
        </div>
      </section>

      {/* CRISIS - GSAP sticky-stack */}
      <section className="relative bg-neutral-950">
        <StickyStack>
          {CRISIS_CARDS.map((c, i) => (
            <div
              key={c.stat}
              className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/70 p-10 backdrop-blur-xl shadow-2xl md:p-14"
            >
              <span className="font-mono text-xs tracking-widest text-white/30">
                {String(i + 1).padStart(2, '0')} / {String(CRISIS_CARDS.length).padStart(2, '0')}
              </span>
              <p className="mt-6 text-6xl font-extrabold tracking-tighter text-white md:text-8xl">
                {c.stat}
              </p>
              <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">{c.label}</p>
              <p className="mt-3 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                {c.note}
              </p>
            </div>
          ))}
        </StickyStack>
      </section>

      {/* MASKOT SCROLL-BOUND SEQUENCE - single statement overlay */}
      <section className="relative h-[300dvh] w-full bg-black">
        <MaskotSequence />
        <div className="pointer-events-none absolute inset-0 z-10 flex h-[100dvh] items-end justify-center pb-20">
          <Reveal className="max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tighter text-white md:text-5xl">
              {t('text_1')}</h2>
          </Reveal>
        </div>
      </section>

      {/* FEATURES - GSAP horizontal-pan */}
      <HorizontalPan className="bg-neutral-950">
        <div className="flex w-full max-w-7xl flex-col gap-6 md:flex-row md:gap-8">
          {FEATURE_PANELS.map(({ icon: Icon, kicker, title, body, accent }) => (
            <div
              key={kicker}
              className="flex w-[85vw] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:w-[34rem]"
            >
              <Icon className={`h-8 w-8 ${accent}`} />
              <span className={`mt-5 text-xs font-bold tracking-widest uppercase ${accent}`}>
                {kicker}
              </span>
              <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </HorizontalPan>

      {/* STATS - plain editorial, no cards */}
      <section className="border-t border-white/10 bg-black py-20">
        <div className="mx-auto max-w-5xl divide-y divide-white/10 px-6">
          {IMPACT.map(({ icon: Icon, value, label }) => (
            <Reveal key={label} className="flex items-center gap-6 py-8">
              <Icon className="h-7 w-7 shrink-0 text-crimson" />
              <span className="w-28 shrink-0 text-3xl font-bold tracking-tighter text-white md:text-4xl">
                {value}
              </span>
              <span className="text-sm leading-snug text-white/55">{label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - asymmetric bento (2 + 1) */}
      <section id="cara-kerja" className="border-t border-white/10 bg-neutral-950 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_2')}</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            <Reveal className="rounded-2xl border border-white/10 bg-gradient-to-br from-crimson/15 to-transparent p-8">
              <Download className="h-8 w-8 text-crimson" />
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">{STEPS[0].title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{STEPS[0].desc}</p>
            </Reveal>
            <Reveal delay={0.08} className="rounded-2xl border border-white/10 bg-gradient-to-br from-navy/20 to-transparent p-8">
              <Brain className="h-8 w-8 text-navy-light" />
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">{STEPS[1].title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{STEPS[1].desc}</p>
            </Reveal>
            <Reveal delay={0.16} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:col-span-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="md:max-w-md">
                  <Heart className="h-8 w-8 text-sage-light" />
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">{STEPS[2].title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{STEPS[2].desc}</p>
                </div>
                <Link href="/dampak">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white hover:bg-white/10"
                  >
                    {t('text_3')}<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ACADEMIC CREDITS - split-screen */}
      <section className="border-t border-white/10 bg-black py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <Reveal className="space-y-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-navy/20 bg-navy/10">
              <GraduationCap className="h-7 w-7 text-navy-light" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
              {t('text_4')}</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              {t('text_5')}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Shield className="h-3.5 w-3.5" /> {t('text_6')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Lock className="h-3.5 w-3.5" /> {t('text_7')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Eye className="h-3.5 w-3.5" /> {t('text_8')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Brain className="h-3.5 w-3.5" /> {t('text_9')}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
            <p className="text-5xl font-extrabold tracking-tighter text-white md:text-6xl">{t('text_10')}</p>
            <p className="mt-2 text-sm text-white/50">{t('text_11')}</p>
            <div className="my-6 h-px w-full bg-white/10" />
            <p className="text-5xl font-extrabold tracking-tighter text-white md:text-6xl">{t('text_12')}</p>
            <p className="mt-2 text-sm text-white/50">{t('text_13')}</p>
            <p className="mt-5 text-[10px] font-bold tracking-widest text-white/30 uppercase">{t('text_14')}</p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA - single intent */}
      <section className="border-t border-white/10 bg-neutral-950 py-24">
        <Reveal className="mx-auto max-w-3xl space-y-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white md:text-5xl">
            {t('text_15')}</h2>
          <p className="text-base text-white/65 md:text-lg">
            {t('text_16')}</p>
          <Link href={ROUTES.REGISTER}>
            <Button
              variant="accent"
              className="rounded-full bg-crimson px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light"
            >
              {t('text_17')}<ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> {t('text_18')}</span>
            <span className="inline-flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5" /> {t('text_19')}</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> {t('text_20')}</span>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
