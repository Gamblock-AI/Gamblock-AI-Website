'use client';

import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PeakHoursChart() {
  const peakData = [
    8, 12, 10, 15, 6, 9, 14, 18, 22, 25, 20, 30, 28, 35, 40, 45, 55, 68, 85, 80,
    58, 42, 28, 15,
  ];

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold tracking-tight text-navy">
        Pola Waktu Penggunaan (Peak Hours)
      </h3>

      <div className="mt-4 space-y-3">
        <div className="flex h-28 items-end justify-between gap-1.5 md:gap-3.5">
          {peakData.map((val, idx) => {
            const isPeak = idx >= 17 && idx <= 19;
            return (
              <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                <div
                  className={`w-full rounded-full transition-all duration-500 ${
                    isPeak ? 'bg-crimson' : 'bg-muted'
                  }`}
                  style={{ height: `${val}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span>00:00</span><span>12:00</span><span>23:59</span>
        </div>

        <div className="flex gap-3 rounded-xl border border-crimson/15 bg-crimson/5 p-4 text-xs leading-relaxed">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
          <div className="space-y-0.5 font-semibold">
            <p className="font-bold text-crimson">
              Aktivitas puncak terdeteksi pada pukul 18:00 - 20:00.
            </p>
            <p className="font-medium text-crimson/70">
              Sistem perlindungan otomatis ditingkatkan ke level maksimal selama jendela waktu ini berdasarkan pola historis.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
