'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

const moods = [
  { emoji: '😫', label: 'Stres' },
  { emoji: '😟', label: 'Cemas' },
  { emoji: '😐', label: 'Biasa' },
  { emoji: '🙂', label: 'Baik' },
  { emoji: '😊', label: 'Hebat' },
];

interface MoodTrackerProps {
  selectedMood: number | null;
  setSelectedMood: (val: number | null) => void;
}

export function MoodTracker({ selectedMood, setSelectedMood }: MoodTrackerProps) {
    const t = useTranslations('MoodTracker');
  return (
    <Card className="p-5">
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-bold text-navy">
          {t('text_176')}</h3>
        <p className="text-xs text-muted-foreground">
          {t('text_177')}</p>
      </div>

      <div className="grid max-w-md grid-cols-5 gap-3">
        {moods.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelectedMood(selectedMood === i ? null : i)}
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-4 transition-all active:scale-95 ${
              selectedMood === i
                ? 'border-navy/30 bg-navy/5 scale-105'
                : 'border-transparent bg-muted/50 hover:bg-muted'
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className={`text-[10px] font-bold ${selectedMood === i ? 'text-navy' : 'text-muted-foreground'}`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
