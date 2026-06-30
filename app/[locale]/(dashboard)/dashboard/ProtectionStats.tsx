'use client';

import { Ban, ShieldCheck, Clock } from 'lucide-react';
import { DashboardSummary } from '@/hooks/use-dashboard-data';
import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

interface ProtectionStatsProps {
  summary: DashboardSummary | null;
}

export function ProtectionStats({ summary }: ProtectionStatsProps) {
    const t = useTranslations('ProtectionStats');
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Card 1: Akses Dicegah */}
      <Card className="group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-crimson/10 transition-transform group-hover:scale-110">
            <Ban className="h-5 w-5 text-crimson" />
          </div>
          <span className="text-label text-muted-foreground">{t('text_102')}</span>
        </div>
        <div className="mt-5 space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">
            {t('text_103')}</span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-navy">
              {summary?.blocked_attempts ?? 142}
            </span>
            <span className="rounded-full bg-crimson/10 px-2 py-0.5 text-xs font-bold text-crimson">+12%</span>
          </div>
        </div>
      </Card>

      {/* Card 2: Efektivitas AI Shield */}
      <Card className="group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/10 transition-transform group-hover:scale-110">
            <ShieldCheck className="h-5 w-5 text-sage" />
          </div>
          <span className="rounded-full bg-sage/10 px-3 py-1 text-label text-sage">
            Stabil
          </span>
        </div>
        <div className="mt-5 space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">
            {t('text_104')}</span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-navy">99.8%</span>
          </div>
        </div>
      </Card>

      {/* Card 3: Durasi Perlindungan */}
      <Card className="group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 transition-transform group-hover:scale-110">
            <Clock className="h-5 w-5 text-navy" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-label text-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Melindungi
          </span>
        </div>
        <div className="mt-5 space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">
            {t('text_105')}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-navy">
              {summary?.active_days ? summary.active_days * 24 : 164}
            </span>
            <span className="text-sm font-bold text-muted-foreground">Jam</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
