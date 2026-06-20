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
    label: 'perputaran dana judi online sepanjang 2025',
    note: 'PPATK, 2026',
  },
  {
    stat: '12,3 jt',
    label: 'orang tercatat melakukan deposit judi online',
    note: 'PPATK, 2026',
  },
  {
    stat: '5,5 jt+',
    label: 'konten judi online ditangani sejak 2017',
    note: 'Kemkomdigi, 2025',
  },
];

const FEATURE_PANELS = [
  {
    icon: Scan,
    kicker: 'deteksi',
    title: 'membaca kamuflase situs judi, detik demi detik.',
    body: 'model hybrid (rule-based + logistic regression) mengekstrak teks dari title, heading, dan anchor text halaman, lalu merepresentasikannya sebagai bag-of-words untuk diklasifikasikan secara lokal. tanpa pernah mengirim data keluar perangkat.',
    accent: 'text-navy-light',
  },
  {
    icon: Heart,
    kicker: 'intervensi',
    title: 'memutus respons impulsif, tepat di momen kritis.',
    body: 'saat situs terindikasi, sistem otomatis menayangkan animasi grafis 5 hingga 10 detik untuk memutus dorongan sesaat, lalu mengalihkan ke laman psikoedukasi berbasis self-regulation theory sebagai tindak lanjut rehabilitasi.',
    accent: 'text-crimson',
  },
  {
    icon: Users,
    kicker: 'akuntabilitas',
    title: 'menjaga keputusan tetap rasional, walau saat ingin menyerah.',
    body: 'setiap permintaan untuk menonaktifkan proteksi memicu verifikasi dari pendamping terdaftar. proses prosedural ini memperlambat impuls, memberi ruang bagi otak untuk berpikir jangka panjang.',
    accent: 'text-sage-light',
  },
  {
    icon: Lock,
    kicker: 'privasi',
    title: 'komputasi penuh di perangkat, data tidak pernah keluar.',
    body: 'arsitektur on-device ai menjalankan seluruh inferensi pada prosesor lokal. tidak ada riwayat penelusuran atau tangkapan layar yang dikirim ke server, sesuai prinsip minimalisasi data dalam undang-undang perlindungan data pribadi.',
    accent: 'text-amber',
  },
];

const STEPS = [
  { icon: Download, title: 'unduh & pasang', desc: 'instal di android atau windows. onboarding singkat, tanpa kartu kredit, gratis untuk mahasiswa.' },
  { icon: Brain, title: 'deteksi otomatis', desc: 'hybrid ai bekerja di latar belakang menganalisis struktur dom, bow teks, dan pola url untuk mengidentifikasi situs berkamuflase.' },
  { icon: Heart, title: 'pulihkan & bangkit', desc: 'pattern interrupt menayangkan intervensi visual, lalu mengarahkan ke modul psikoedukasi dan jurnal refleksi mandiri.' },
];

const IMPACT = [
  { icon: TrendingDown, value: '-68%', label: 'penurunan dorongan impulsif saat friction aktif' },
  { icon: Activity, value: '5-10 dtk', label: 'durasi animasi pattern interrupt' },
  { icon: Shield, value: '99,8%', label: 'akurasi klasifikasi hybrid rule + ml' },
];

export default function LandingPage() {
  const reduce = useReducedMotion();

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
            <h1 className="text-[13vw] font-bold leading-[0.95] tracking-tighter text-white md:text-[7rem]">
              lindungi diri
              <br />
              <span className="text-crimson">anda.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-snug text-white/80 md:text-lg">
              pemblokiran judi online berbasis on-device ai dengan intervensi psikologis otomatis untuk mahasiswa indonesia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="accent"
                  className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light"
                >
                  mulai gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/technology">
                <Button
                  variant="ghost"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition-colors hover:bg-white/10"
                >
                  pahami teknologinya
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
            perputaran dana judi online 2025. ppatk.
          </p>
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
              deteksi yang bekerja diam-diam, melindungi tanpa henti.
            </h2>
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
              tiga langkah menuju kendali diri.
            </h2>
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
                    lihat jalur pemulihan <ArrowRight className="ml-2 h-4 w-4" />
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
              program kreativitas mahasiswa.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              didanai pkm karsa cipta 2026. dikembangkan tim mahasiswa sebagai solusi teknologi
              untuk mengatasi darurat judi online di kalangan mahasiswa indonesia.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Shield className="h-3.5 w-3.5" /> on-device ai
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Lock className="h-3.5 w-3.5" /> patuh uu pdp
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Eye className="h-3.5 w-3.5" /> dom analysis
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/45">
                <Brain className="h-3.5 w-3.5" /> logistic regression
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
            <p className="text-5xl font-extrabold tracking-tighter text-white md:text-6xl">440 rb</p>
            <p className="mt-2 text-sm text-white/50">pemain usia 10-20 tahun</p>
            <div className="my-6 h-px w-full bg-white/10" />
            <p className="text-5xl font-extrabold tracking-tighter text-white md:text-6xl">520 rb</p>
            <p className="mt-2 text-sm text-white/50">pemain usia 21-30 tahun</p>
            <p className="mt-5 text-[10px] font-bold tracking-widest text-white/30 uppercase">ppatk, 2025</p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA - single intent */}
      <section className="border-t border-white/10 bg-neutral-950 py-24">
        <Reveal className="mx-auto max-w-3xl space-y-6 px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white md:text-5xl">
            putuskan siklus kecanduan, hari ini.
          </h2>
          <p className="text-base text-white/65 md:text-lg">
            gratis, 100% privat, dirancang oleh dan untuk mahasiswa indonesia.
          </p>
          <Link href={ROUTES.REGISTER}>
            <Button
              variant="accent"
              className="rounded-full bg-crimson px-8 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] hover:bg-crimson-light"
            >
              mulai gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> android
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5" /> windows
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> 100% privat
            </span>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
