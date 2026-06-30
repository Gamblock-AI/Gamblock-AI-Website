'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

const initialMissions = [
  'Tidak mengakses situs/aplikasi judi hari ini',
  'Menulis 1 entri jurnal refleksi pemulihan',
  'Melakukan meditasi pernapasan Pattern Interrupt',
  'Berbagi kabar atau berdiskusi dengan pendamping terdaftar',
  'Menyelesaikan setidaknya 1 modul psikoedukasi kesadaran',
];

interface MissionsListProps {
  checked: boolean[];
  toggleCheck: (idx: number) => void;
  completedCount: number;
}

export function MissionsList({ checked, toggleCheck, completedCount }: MissionsListProps) {
    const t = useTranslations('MissionsList');
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between border-b border-border pb-3 mb-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-navy">{t('text_173')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('text_174')}</p>
        </div>
        <span className="shrink-0 rounded-full bg-navy/10 px-3.5 py-1.5 text-xs font-bold text-navy">
          {completedCount}{t('text_175')}</span>
      </div>

      <div className="space-y-3">
        {initialMissions.map((m, i) => (
          <div
            key={i}
            onClick={() => toggleCheck(i)}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all select-none ${
              checked[i]
                ? 'border-sage/20 bg-sage/5 text-muted-foreground/60'
                : 'border-border bg-card text-foreground hover:border-navy/20 hover:bg-muted/50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => {}}
              className="mt-0.5 h-5 w-5 cursor-pointer rounded border-input text-sage accent-sage"
            />
            <span className={`text-sm leading-relaxed font-semibold ${checked[i] ? 'text-muted-foreground/50 line-through' : 'text-foreground'}`}>
              {m}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
