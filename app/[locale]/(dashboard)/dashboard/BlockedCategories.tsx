'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

export function BlockedCategories() {
    const t = useTranslations('BlockedCategories');
  const categories = [
    { label: 'Slot Online', percent: 65, color: 'bg-crimson' },
    { label: 'Sports Betting', percent: 22, color: 'bg-navy' },
    { label: 'Poker / Kasino', percent: 10, color: 'bg-navy/50' },
    { label: 'Lainnya', percent: 3, color: 'bg-navy/25' },
  ];

  return (
    <Card className="p-5 transition-shadow hover:shadow-card">
      <h3 className="text-sm font-bold tracking-tight text-navy">
        {t('text_96')}</h3>

      <div className="mt-4 space-y-3.5">
        {categories.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{item.label}</span>
              <span className="font-bold text-navy">{item.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${item.color}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
