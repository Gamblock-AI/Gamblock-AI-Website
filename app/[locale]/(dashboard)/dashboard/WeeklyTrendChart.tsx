'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

export function WeeklyTrendChart() {
    const t = useTranslations('WeeklyTrendChart');
  return (
    <Card className="p-5 transition-shadow hover:shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-navy">{t('text_106')}</h3>
        <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-navy uppercase">
          7 hari
        </span>
      </div>

      <div className="relative mt-4 h-44 w-full">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[11px] font-semibold text-muted-foreground">
          <div className="flex w-full items-center justify-between border-b border-border pb-1">
            <span>50</span>
          </div>
          <div className="flex w-full items-center justify-between border-b border-border pb-1">
            <span>25</span>
          </div>
          <div className="flex w-full items-center justify-between border-b border-border pb-1">
            <span>0</span>
          </div>
        </div>

        <svg className="h-full w-full pt-6" viewBox="0 0 600 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradWt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16294C" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#16294C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 50 170 C 120 120, 180 80, 250 140 C 320 160, 380 90, 450 130 C 500 110, 520 70, 550 50 L 550 170 L 50 170 Z"
            fill="url(#areaGradWt)"
          />
          <path
            d="M 50 170 C 120 120, 180 80, 250 140 C 320 160, 380 90, 450 130 C 500 110, 520 70, 550 50"
            fill="none"
            stroke="#16294C"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="250" cy="140" r="5" fill="#16294C" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="450" cy="130" r="5" fill="#16294C" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="550" cy="50" r="5" fill="#C8102E" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        <div className="absolute -bottom-6 right-0 left-0 flex justify-between px-4 text-[11px] font-semibold text-muted-foreground">
          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
        </div>
      </div>
      <div className="pt-6" />
    </Card>
  );
}
