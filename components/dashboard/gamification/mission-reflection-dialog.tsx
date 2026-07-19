'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/feedback';
import { cn } from '@/lib/utils';

type ReflectionFeeling = 'helped' | 'mixed' | 'difficult';

interface MissionReflectionDialogProps {
  open: boolean;
  missionDate: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function MissionReflectionDialog({
  open,
  missionDate,
  onOpenChange,
  onSaved,
}: MissionReflectionDialogProps) {
  const t = useTranslations('recoveryDashboard');
  const [feeling, setFeeling] = useState<ReflectionFeeling>('helped');
  const [note, setNote] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient('/recovery-records', {
        method: 'PUT',
        body: JSON.stringify({
          id: `mission_reflection_${missionDate}`,
          kind: 'mission_reflection',
          record_date: missionDate,
          status: 'active',
          metadata: { schema_version: 1, source: 'daily_mission' },
          content: JSON.stringify({
            feeling,
            note: note.trim(),
            next_step: nextStep.trim(),
          }),
        }),
      });
      toastSuccess(t('reflectionSaved'));
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toastError(error, t('reflectionError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,40rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy text-lg font-bold">
            {t('reflectionTitle')}
          </DialogTitle>
          <DialogDescription>{t('reflectionDescription')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2" role="group">
          {(['helped', 'mixed', 'difficult'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={feeling === option}
              onClick={() => setFeeling(option)}
              className={cn(
                'focus-visible:ring-navy/30 min-h-12 rounded-xl border px-2 text-xs font-semibold outline-none focus-visible:ring-2 sm:text-sm',
                feeling === option
                  ? 'border-navy bg-navy text-white'
                  : 'border-border hover:bg-muted'
              )}
            >
              {t(
                option === 'helped'
                  ? 'reflectionHelped'
                  : option === 'mixed'
                    ? 'reflectionMixed'
                    : 'reflectionDifficult'
              )}
            </button>
          ))}
        </div>

        <label className="text-navy text-sm font-bold">
          {t('reflectionNote')}
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1200}
            rows={3}
            placeholder={t('reflectionNotePlaceholder')}
            className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-navy/30 mt-2 w-full resize-y rounded-xl border p-3 font-normal outline-none focus-visible:ring-2"
          />
        </label>
        <label className="text-navy text-sm font-bold">
          {t('reflectionNextStep')}
          <input
            value={nextStep}
            onChange={(event) => setNextStep(event.target.value)}
            maxLength={240}
            placeholder={t('reflectionNextStepPlaceholder')}
            className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-navy/30 mt-2 min-h-12 w-full rounded-xl border px-3 font-normal outline-none focus-visible:ring-2"
          />
        </label>

        <DialogFooter>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={saving}
            onClick={() => void save()}
          >
            {t(saving ? 'reflectionSaving' : 'reflectionSave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
