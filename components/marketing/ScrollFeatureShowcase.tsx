'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Shield, Users, Scan, Heart, Eye } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from "next-intl";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const POSES = [
  {
    key: 'deteksi',
    pose: 'Pose 1',
    label: 'Deteksi Real-Time',
    icon: Scan,
    title: 'membaca kamuflase situs judi,',
    accent: 'detik demi detik.',
    body:
      'model hybrid (rule-based + logistic regression) mengekstrak teks dari title, heading, dan anchor text sebuah halaman, lalu merepresentasikannya sebagai bag-of-words untuk diklasifikasikan secara lokal — tanpa pernah mengirim data keluar perangkat.',
    chip: 'edge ai',
    color: 'text-navy-light',
    bg: 'from-navy/20 to-transparent',
    border: 'border-navy/30', image: '/images/features/deteksi.jpg',
  },
  {
    key: 'intervensi',
    pose: 'Pose 2',
    label: 'Pattern Interrupt',
    icon: Heart,
    title: 'memutus respons impulsif,',
    accent: 'tepat di momen kritis.',
    body:
      'saat situs terindikasi, sistem otomatis menayangkan animasi grafis 5–10 detik untuk memutus dorongan sesaat, lalu mengalihkan ke laman psikoedukasi berbasis self-regulation theory sebagai tindak lanjut rehabilitasi.',
    chip: '5–10 detik',
    color: 'text-crimson',
    bg: 'from-crimson/20 to-transparent',
    border: 'border-crimson/30', image: '/images/features/intervensi.jpg',
  },
  {
    key: 'komitmen',
    pose: 'Pose 3',
    label: 'Akuntabilitas Sosial',
    icon: Users,
    title: 'menjaga keputusan tetap rasional,',
    accent: 'walau saat ingin menyerah.',
    body:
      'setiap permintaan untuk menonaktifkan proteksi akan memicu verifikasi dari pendamping terdaftar. proses prosedural ini memperlambat impuls, memberi ruang bagi otak untuk berpikir jangka panjang.',
    chip: 'social protocol',
    color: 'text-sage-light',
    bg: 'from-sage/20 to-transparent',
    border: 'border-sage/30', image: '/images/features/komitmen.jpg',
  },
];

export function ScrollFeatureShowcase() {
    const t = useTranslations('ScrollFeatureShowcase');
  const sectionRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const stages = stagesRef.current.filter(Boolean) as HTMLDivElement[];
      const total = stages.length;

      // Hide all stages initially (except first)
      gsap.set(stages.slice(1), { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * total}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      stages.forEach((stage, i) => {
        if (i === 0) {
          tl.fromTo(
            stage,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
            i
          );
        } else {
          tl.to(stages[i - 1], { opacity: 0, y: -40, duration: 1, ease: 'power2.in' }, i)
            .fromTo(stage, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i);
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="fitur-showcase"
      className="relative h-[100dvh] w-full overflow-hidden bg-neutral-950"
    >
      {/* Backdrop dot grid */}
      <div className="absolute inset-0 bg-dot-subtle-dark opacity-60" />

      {/* Persistent badge top-left */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3 md:top-12 md:left-16">
        <span className="rounded-full border border-crimson/20 bg-crimson/10 px-4 py-1.5 text-xs font-bold tracking-wider text-crimson uppercase backdrop-blur">
          mekanisme
        </span>
        <span className="hidden text-xs font-medium text-white/40 md:inline">
          {t('text_320')}</span>
      </div>

      {/* Persistent chapter counter top-right */}
      <div className="absolute top-8 right-8 z-20 hidden items-center gap-2 md:flex md:top-12 md:right-16">
        <span className="text-xs font-bold tracking-widest text-white/30 uppercase">
          {t('text_321')}</span>
      </div>

      {/* Stages container */}
      <div className="relative flex h-full w-full items-center justify-center">
        {POSES.map((pose, i) => {
          const Icon = pose.icon;
          return (
            <div
              key={pose.key}
              ref={(el) => {
                stagesRef.current[i] = el;
              }}
              className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24"
            >
              <div className="grid w-full items-center gap-10 md:grid-cols-[1.1fr_1fr]">
                {/* Left: copy */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${pose.border} bg-gradient-to-br ${pose.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${pose.color}`} />
                    </span>
                    <span className={`text-label ${pose.color}`}>
                      {pose.pose} · {pose.label}
                    </span>
                  </div>
                  <h2 className="text-display text-4xl leading-[1.05] tracking-tight text-white md:text-6xl">
                    {pose.title}
                    <br />
                    <span className={pose.color}>{pose.accent}</span>
                  </h2>
                  <p className="max-w-md text-base leading-relaxed text-white/65 md:text-lg">
                    {pose.body}
                  </p>
                </div>

                {/* Right: visual card */}
                <div className="relative aspect-square w-full max-w-md justify-self-center md:justify-self-end">
                  <div
                    className={`absolute inset-0 rounded-3xl border ${pose.border} bg-gradient-to-br ${pose.bg} backdrop-blur-xl shadow-2xl`}
                  />
                  <div className="relative flex h-full flex-col justify-between p-8">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border ${pose.border} bg-black/40 px-3 py-1 text-[10px] font-bold tracking-wider ${pose.color} uppercase`}>
                        {pose.chip}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-white/30">
                        0{i + 1}/0{POSES.length}
                      </span>
                    </div>

                    {/* Center icon */}
                    <div className="flex flex-1 items-center justify-center">
                      <div
                        className={`flex h-32 w-32 items-center justify-center rounded-full border ${pose.border} bg-black/30 backdrop-blur-md md:h-40 md:w-40`}
                      >
                        <Icon className={`h-14 w-14 ${pose.color} md:h-16 md:w-16`} />
                      </div>
                    </div>

                    {/* Bottom metric strip */}
                    <div className="flex items-end justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                          mekanisme
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">{pose.label}</p>
                      </div>
                      <Shield className="h-5 w-5 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ScrollFeatureShowcase;
