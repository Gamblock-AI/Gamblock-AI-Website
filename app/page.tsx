'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Brain, Users, Heart, ArrowRight, Sparkles, Zap, Star, Lock, Download, Smartphone, Monitor, Check, GraduationCap, Eye, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import MaskotSequence from '@/components/MaskotSequence';

/* ------------------------------------------------------------------ */
/*  Data dari Proposal PKM Karsa Cipta                                */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Scan,
    title: 'deteksi real-time berbasis konten',
    desc: 'sistem menganalisis struktur DOM halaman secara langsung menggunakan metode hybrid analysis — rule-based dan logistic regression — untuk mendeteksi situs judi berkamuflase dengan akurasi tinggi.',
  },
  {
    icon: Eye,
    title: 'pattern interrupt visual',
    desc: 'intervensi psikologis otomatis berupa animasi grafis 5-10 detik yang dirancang untuk memutus respons impulsif pengguna tepat pada momen kritis saat deteksi terjadi.',
  },
  {
    icon: Users,
    title: 'accountability partner',
    desc: 'mekanisme social accountability protocol mencegah pencopotan aplikasi secara sepihak. setiap permohonan uninstall memerlukan persetujuan eksplisit dari pendamping terdaftar.',
  },
  {
    icon: Shield,
    title: 'on-device ai & privasi',
    desc: 'seluruh proses komputasi dieksekusi 100% lokal pada perangkat menggunakan arsitektur edge computing — tidak ada data penelusuran yang dikirim ke server eksternal.',
  },
];

const steps = [
  { step: '1', icon: Download, title: 'unduh & pasang', desc: 'instal aplikasi di android atau windows.' },
  { step: '2', icon: Sparkles, title: 'deteksi & intervensi', desc: 'sistem bekerja di latar belakang.' },
  { step: '3', icon: Heart, title: 'pulihkan diri', desc: 'akses modul psikoedukasi dan misi harian.' },
];

const stats = [
  { value: 'Rp286T', label: 'perputaran dana judi online 2025', source: '(PPATK, 2026)' },
  { value: '12,3 jt', label: 'orang tercatat deposit judi online', source: '(PPATK, 2026)' },
  { value: '5,5 jt+', label: 'konten judi ditangani sejak 2017', source: '(Kemkomdigi, 2025)' },
];

/* ------------------------------------------------------------------ */
/*  Reveal wrapper                                                     */
/* ------------------------------------------------------------------ */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="bg-black text-white">
      {/* ================================================================ */}
      {/*  HERO SECTION                                                     */}
      {/* ================================================================ */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Background Video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/videos/hero-bg.mp4"
        />
        {/* Gradient overlay with navy + crimson tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0D2C54]/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Bottom Gradient Overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />

        {/* ===== NAVBAR ===== */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
          {/* Left: Logo pill */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 py-3 pr-5 pl-4 backdrop-blur transition-colors hover:border-navy/30">
            <Image
              src="/images/logo.jpg"
              alt="Gamblock AI"
              width={22}
              height={22}
              className="rounded-md"
            />
            <span className="text-sm font-semibold tracking-tight text-white">
              gamblock ai
            </span>
          </Link>

          {/* Center: Nav links (hidden mobile) */}
          <div className="hidden items-center gap-1 rounded-full border border-white/5 bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
            {[
              { href: '#masalah', label: 'masalah' },
              { href: '#teknologi', label: 'teknologi' },
              { href: '#fitur', label: 'fitur' },
              { href: '#unduh', label: 'unduh' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="rounded-full px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right: CTA */}
          <Link href={ROUTES.REGISTER}>
            <Button
              variant="accent"
              size="sm"
              className="rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-crimson-light"
            >
              mulai gratis
            </Button>
          </Link>
        </nav>

        {/* ===== HERO TYPOGRAPHY ===== */}
        <div className="relative h-full w-full">
          {/* PKM Badge — top-right */}
          <div className="absolute top-[14%] right-6 z-10 md:right-24">
            <div className="flex items-center justify-end gap-3">
              <div className="hidden h-px w-20 rotate-[20deg] bg-crimson/40 md:block" />
              <span className="rounded-full border border-crimson/20 bg-crimson/10 px-4 py-1.5 text-xs font-bold tracking-wider text-crimson uppercase backdrop-blur">
                pkm karsa cipta
              </span>
            </div>
          </div>

          {/* lindungi */}
          <h1 className="hero-title absolute top-[18%] left-4 text-[13vw] font-bold tracking-tighter text-white md:left-10 md:text-[11vw]">
            lindungi
          </h1>

          {/* diri */}
          <h1 className="hero-title absolute top-[38%] right-4 text-[13vw] font-bold tracking-tighter text-white md:right-10 md:text-[11vw]">
            diri
          </h1>

          {/* Description paragraph with crimson accent */}
          <p className="absolute top-[46%] left-6 z-10 max-w-[260px] text-[15px] leading-snug text-white/80 md:left-10">
            sistem pemblokiran judi online berbasis{' '}
            <span className="font-semibold text-crimson">on-device ai</span> dengan
            intervensi psikologis otomatis untuk mahasiswa indonesia
          </p>

          {/* anda */}
          <h1 className="hero-title absolute top-[58%] left-[16%] text-[13vw] font-bold tracking-tighter text-white md:left-[26%] md:text-[11vw]">
            anda
          </h1>

          {/* Stat block — bottom-left */}
          <div className="absolute bottom-20 left-6 z-10 md:bottom-24 md:left-20">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold tracking-tighter text-white md:text-5xl">
                Rp286<span className="text-crimson">T</span>
              </span>
              <div className="hidden h-px w-20 rotate-[-20deg] bg-navy/60 md:block" />
            </div>
            <p className="mt-1 max-w-[200px] text-xs leading-snug text-white/50 md:text-sm">
              perputaran dana judi online sepanjang 2025
            </p>
          </div>

          {/* Stat block — bottom-right */}
          <div className="absolute bottom-16 right-6 z-10 md:bottom-20 md:right-20">
            <div className="flex items-center justify-end gap-3">
              <div className="hidden h-px w-20 rotate-[-20deg] bg-navy/60 md:block" />
              <span className="text-4xl font-bold tracking-tighter text-white md:text-5xl">
                12,3<span className="text-crimson"> jt</span>
              </span>
            </div>
            <p className="mt-1 text-right text-xs leading-snug text-white/50 md:text-sm">
              orang tercatat deposit judi online
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  SCROLL-BOUND ANIMATION SECTIONS (400vh total)                    */}
      {/* ================================================================ */}
      <section className="relative h-[400dvh] w-full bg-black">
        <MaskotSequence />

        <div className="relative z-10 w-full pointer-events-auto">
          
          {/* 1. POSE 1: Masalah */}
          <div id="masalah" className="flex h-[100dvh] items-center px-6 md:px-16 lg:px-24">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/60 p-10 backdrop-blur-xl shadow-2xl">
              <Reveal className="space-y-6">
                <span className="inline-block rounded-full border border-crimson/20 bg-crimson/10 px-4 py-1.5 text-xs font-bold tracking-wider text-crimson uppercase">
                  darurat nasional
                </span>
                <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl leading-tight">
                  judi online bukan hiburan.
                  <br />
                  <span className="text-crimson">ini krisis generasi.</span>
                </h2>
                <p className="text-lg leading-relaxed text-white/70">
                  sepanjang 2025, perputaran dana judi online mencapai{' '}
                  <span className="font-semibold text-white">rp286,84 triliun</span> dengan{' '}
                  <span className="font-semibold text-white">12,3 juta</span> orang tercatat melakukan deposit.
                </p>
                <div className="pt-4 flex gap-4">
                  <div className="border-l-2 border-crimson/50 pl-4">
                    <p className="text-2xl font-bold text-white">65%</p>
                    <p className="text-xs text-white/50">pengguna adalah gen-z</p>
                  </div>
                  <div className="border-l-2 border-crimson/50 pl-4">
                    <p className="text-2xl font-bold text-white">1.2M+</p>
                    <p className="text-xs text-white/50">mahasiswa terjerat</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* 2. POSE 2: Teknologi */}
          <div id="teknologi" className="flex h-[100dvh] items-center justify-end px-6 md:px-16 lg:px-24">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-black/60 p-10 backdrop-blur-xl shadow-2xl">
              <Reveal className="mb-8">
                <span className="inline-block rounded-full border border-navy/30 bg-navy/10 px-4 py-1.5 text-xs font-bold tracking-wider text-navy-light uppercase">
                  teknologi
                </span>
                <h2 className="mt-4 text-4xl font-bold tracking-tighter text-white md:text-5xl">
                  hybrid analysis + on-device ai
                </h2>
                <p className="mt-4 text-lg text-white/70 leading-relaxed">
                  sistem mendeteksi situs judi yang berkamuflase menggunakan kombinasi <span className="text-navy-light font-semibold">rule-based system</span> dan <span className="text-navy-light font-semibold">logistic regression</span>. semua komputasi terjadi 100% lokal di perangkat Anda.
                </p>
              </Reveal>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-navy/20 bg-gradient-to-br from-navy/20 to-transparent p-6">
                  <Shield className="mb-4 h-8 w-8 text-navy-light" />
                  <h3 className="text-lg font-bold text-white mb-2">edge computing privasi</h3>
                  <p className="text-sm text-white/60">tidak ada data riwayat penelusuran yang pernah dikirim ke server. komputasi AI berjalan langsung pada prosesor lokal perangkat.</p>
                </div>
                <div className="rounded-2xl border border-crimson/20 bg-gradient-to-br from-crimson/20 to-transparent p-6">
                  <Scan className="mb-4 h-8 w-8 text-crimson" />
                  <h3 className="text-lg font-bold text-white mb-2">ekstraksi DOM instan</h3>
                  <p className="text-sm text-white/60">menangkap dan menganalisis teks tersembunyi, meta tags, dan struktur elemen secara real-time sebelum halaman sempat dimuat penuh.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. POSE 3: Fitur */}
          <div id="fitur" className="flex h-[100dvh] items-center px-6 md:px-16 lg:px-24">
            <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-black/60 p-10 backdrop-blur-xl shadow-2xl">
              <Reveal className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl">
                  ekosistem yang mendukung kepulihan
                </h2>
                <p className="mt-4 text-lg text-white/60 max-w-2xl">
                  bukan sekadar pemblokir biasa. gamblock ai merancang intervensi psikologis komprehensif untuk memutus siklus kecanduan secara bertahap.
                </p>
              </Reveal>
              <div className="grid gap-6 md:grid-cols-2">
                {features.map(({ icon: Icon, title, desc }, i) => (
                  <Reveal key={title} delay={i * 0.15} className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/20 text-navy-light group-hover:bg-navy group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                      <p className="text-sm leading-relaxed text-white/60">{desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          {/* 4. POSE 4: Unduh */}
          <div id="unduh" className="flex h-[100dvh] items-center justify-end px-6 md:px-16 lg:px-24">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/60 p-12 text-center backdrop-blur-xl shadow-2xl">
              <Reveal>
                <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl mb-6">
                  ambil kendali atas hidup anda, sekarang.
                </h2>
                <p className="text-lg text-white/70 mb-10">
                  aplikasi gratis, 100% privat, dirancang khusus oleh dan untuk mahasiswa indonesia. putuskan siklus kecanduan hari ini.
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link href={ROUTES.REGISTER} className="block">
                    <Button variant="accent" className="w-full rounded-full bg-crimson py-7 text-lg font-bold text-white hover:bg-crimson-light">
                      unduh & mulai gratis <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.LOGIN} className="block">
                    <Button variant="ghost" className="w-full rounded-full border border-white/20 bg-white/5 py-7 text-lg text-white hover:bg-white/10">
                      sudah punya akun?
                    </Button>
                  </Link>
                </div>
                
                <p className="mt-8 text-xs text-white/40">
                  didukung oleh program kreativitas mahasiswa karsa cipta (pkm-kc) 2026.
                </p>
              </Reveal>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/*  STATS — data dari proposal                                       */}
      {/* ================================================================ */}
      <section className="relative z-20 border-t border-neutral-800 bg-black py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {stats.map(({ value, label, source }) => (
              <Reveal key={label}>
                <div className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
                  {value.includes('Rp') || value.includes('jt') || value.includes('jt+') ? (
                    <>
                      {value.split(/(?=T|jt|jt\+)/)[0]}
                      <span className="text-crimson">{value.match(/(T|jt|jt\+)/)?.[0]}</span>
                    </>
                  ) : (
                    value
                  )}
                </div>
                <div className="mt-1 text-sm text-white/40">
                  {label}
                </div>
                <div className="mt-0.5 text-[10px] text-white/20">
                  {source}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  ACADEMIC CREDITS                                                 */}
      {/* ================================================================ */}
      <section className="relative z-20 border-t border-neutral-800 bg-neutral-950 py-12 md:py-16">
        <Reveal className="mx-auto max-w-2xl space-y-4 px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-navy/20 bg-navy/10">
            <GraduationCap className="h-7 w-7 text-navy-light" />
          </div>
          <h2 className="text-2xl font-bold tracking-tighter text-white">
            program kreativitas mahasiswa
          </h2>
          <p className="text-sm leading-relaxed text-white/40">
            didanai oleh program <span className="font-semibold text-navy-light">pkm karsa cipta 2026</span> —
            dikembangkan oleh tim mahasiswa sebagai solusi teknologi untuk mengatasi
            darurat judi online di kalangan mahasiswa indonesia.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/40">
              <Shield className="h-3.5 w-3.5" /> on-device ai
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/40">
              <Lock className="h-3.5 w-3.5" /> patuh uu pdp
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/40">
              <Brain className="h-3.5 w-3.5" /> logistic regression
            </span>
          </div>
        </Reveal>
      </section>

      {/* ================================================================ */}
      {/*  FOOTER                                                           */}
      {/* ================================================================ */}
      <footer className="relative z-20 border-t border-neutral-800 bg-neutral-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo.jpg"
              alt="Gamblock AI"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-semibold tracking-tight text-white/50">
              gamblock ai
            </span>
            <span className="rounded-full border border-crimson/20 bg-crimson/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-crimson uppercase">
              pkm kc 2026
            </span>
          </div>

          <div className="flex gap-6 text-xs font-medium text-white/25">
            <Link href={ROUTES.EDUCATION} className="transition-colors hover:text-white/50">
              psikoedukasi
            </Link>
            <Link href={ROUTES.SUPPORT} className="transition-colors hover:text-white/50">
              bantuan
            </Link>
            <Link href={ROUTES.LOGIN} className="transition-colors hover:text-white/50">
              masuk
            </Link>
          </div>

          <p className="text-xs text-white/15">
            © 2026 gamblock ai · pkm karsa cipta · hak cipta dilindungi
          </p>
        </div>
      </footer>
    </div>
  );
}
