'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import { Ban, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

export function LastInterventions() {
    const t = useTranslations('LastInterventions');
  const interventions = [
    { title: 'Slot Online (...)', time: 'Baru saja', desc: 'Upaya akses ke domain slotgacor.com dicegah.', type: 'block' },
    { title: 'Sports Betting ...', time: '2j lalu', desc: 'Koneksi latar belakang ke judi.com diblokir.', type: 'block' },
    { title: 'Sistem AI Dikalibrasi', time: 'Kemarin', desc: 'Pembaruan heuristik perlindungan selesai.', type: 'system' },
  ];

  return (
    <Card className="p-5 transition-shadow hover:shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-navy">{t('text_97')}</h3>
        <Link
          href={ROUTES.PROGRESS}
          className="text-label text-crimson transition-colors hover:text-crimson/80"
        >
          {t('text_98')}</Link>
      </div>

      <div className="mt-4 space-y-1">
        {interventions.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                item.type === 'block' ? 'bg-crimson/10 text-crimson' : 'bg-navy/10 text-navy'
              }`}
            >
              {item.type === 'block' ? <Ban className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="truncate text-xs font-semibold text-navy">{item.title}</h4>
                <span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span>
              </div>
              <p className="truncate text-[11px] leading-normal text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
