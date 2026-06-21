'use client';

import Link from 'next/link';
import { BookOpen, Brain, Heart, AlertTriangle, Target, Clock, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

const modules = [
  { slug: 'kesadaran-impulsif', title: 'Kesadaran Impulsif', desc: 'Memahami dorongan impulsif dan cara mengenalinya sejak dini.', icon: BookOpen, duration: '4 Menit Baca', progress: 70, color: 'text-navy', bg: 'bg-navy/10' },
  { slug: 'pengendalian-diri', title: 'Pengendalian Diri', desc: 'Teknik praktis untuk menahan diri dari perilaku destruktif.', icon: Brain, duration: '6 Menit Baca', progress: 0, color: 'text-amber', bg: 'bg-amber/10' },
  { slug: 'regulasi-emosi', title: 'Regulasi Emosi', desc: 'Mengelola emosi negatif yang memicu keinginan berjudi.', icon: Heart, duration: '5 Menit Baca', progress: 35, color: 'text-crimson', bg: 'bg-crimson/10' },
  { slug: 'bahaya-judi-online', title: 'Bahaya Judi Online', desc: 'Dampak finansial, sosial, dan psikologis dari judi online.', icon: AlertTriangle, duration: '8 Menit Baca', progress: 100, color: 'text-sage', bg: 'bg-sage/10' },
  { slug: 'membangun-kebiasaan-baru', title: 'Membangun Kebiasaan Baru', desc: 'Strategi membentuk rutinitas positif pengganti.', icon: Target, duration: '7 Menit Baca', progress: 0, color: 'text-navy', bg: 'bg-navy/10' },
];

interface BackendModule {
  id: string; slug: string; title: string; summary: string; estimated_minutes: number; progress: number;
}

export default function EducationPage() {
    const t = useTranslations('educationPage');
  const [modulesList, setModulesList] = useState<typeof modules>(modules);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await apiClient<BackendModule[]>('/psychoeducation/modules');
        if (data && data.length > 0) {
          const icons = [BookOpen, Brain, Heart, AlertTriangle, Target];
          const colors = ['text-navy', 'text-amber', 'text-crimson', 'text-sage', 'text-navy'];
          const bgs = ['bg-navy/10', 'bg-amber/10', 'bg-crimson/10', 'bg-sage/10', 'bg-navy/10'];
          const mapped = data.map((m, idx) => ({
            slug: m.slug, title: m.title, desc: m.summary,
            icon: icons[idx % icons.length],
            duration: `${m.estimated_minutes} Menit Baca`,
            progress: Math.round(m.progress * 100) || 0,
            color: colors[idx % colors.length],
            bg: bgs[idx % bgs.length],
          }));
          setModulesList(mapped);
        }
      } catch { /* ignore */ }
    };
    setTimeout(() => { fetchModules(); }, 0);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="border-navy/10 bg-navy/[0.02] p-5">
        <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-label text-navy">
          {t('text_137')}</span>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy">
          {t('text_138')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('text_139')}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulesList.map((m) => (
          <Link key={m.slug} href={`/education/${m.slug}`} className="group block">
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
              <div className="p-5 flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg} ${m.color}`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{m.duration}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-extrabold text-navy transition-colors group-hover:text-navy-dark">
                    {m.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase">
                    <span>{t('text_140')}</span>
                    <span className={m.progress === 100 ? 'text-sage font-extrabold' : 'text-navy'}>{m.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.progress === 100 ? 'bg-sage' : 'bg-navy'}`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-navy group-hover:underline">
                      {t('text_141')}<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
