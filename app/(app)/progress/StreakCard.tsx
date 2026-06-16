'use client';

import { Flame } from 'lucide-react';
import { ProgressSnapshot } from '@/hooks/use-progress-data';

interface StreakCardProps {
  progress: ProgressSnapshot | null;
}

export function StreakCard({ progress }: StreakCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy p-5 text-white">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Flame className="h-6 w-6 text-amber" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold tracking-wider uppercase">Streak Pemulihan</h4>
            <span className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              Bebas Judi
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="flex items-baseline text-3xl font-black tracking-tight">
            {progress?.active_days || 12}{' '}
            <span className="ml-1.5 text-base font-bold text-white/80">Hari</span>
          </p>
          <p className="pt-2 text-xs leading-relaxed text-white/80">
            Hebat! Anda berhasil bertahan selama satu minggu penuh. Pertahankan konsistensi ini untuk memperkuat regulasi kognitif Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
