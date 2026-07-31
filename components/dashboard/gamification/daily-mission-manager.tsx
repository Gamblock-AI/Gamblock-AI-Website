'use client';

import { Plus, RefreshCw, Target } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { MissionTaskCard } from '@/components/dashboard/gamification/mission-task-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyMission, type DailyMissionItem } from '@/hooks/use-daily-mission';
import { toastError, toastSuccess } from '@/lib/feedback';
import { SYSTEM_MISSION_COPY } from '@/lib/recovery/mission-catalog';

function taskPresentation(task: DailyMissionItem, t: ReturnType<typeof useTranslations>) {
  if (task.source === 'custom') {
    return { label: task.title ?? t('customMissionUntitled'), actionLabel: undefined, actionHref: undefined };
  }
  const copy = task.system_key ? SYSTEM_MISSION_COPY[task.system_key] : undefined;
  return {
    label: copy ? t(copy.labelKey) : t('missionUnavailable'),
    actionLabel: copy ? t(copy.actionKey) : undefined,
    actionHref: copy?.href,
  };
}

export function DailyMissionManager({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('recoveryDashboard');
  const mission = useDailyMission();
  const [title, setTitle] = useState('');
  const [editingID, setEditingID] = useState<string | null>(null);
  const customCount = mission.items.filter((task) => task.source === 'custom').length;

  const saveCustom = async () => {
    const saved = editingID
      ? await mission.updateCustomMission(editingID, title)
      : await mission.createCustomMission(title);
    if (!saved) {
      toastError(mission.error, t('missionError'));
      return;
    }
    toastSuccess(t(editingID ? 'customMissionUpdated' : 'customMissionAdded'));
    setTitle('');
    setEditingID(null);
  };

  const claimTask = async (task: DailyMissionItem) => {
    const previousLevel = mission.mission?.experience.level ?? 1;
    const updated = await mission.claimMission(task.id);
    if (!updated) {
      toastError(mission.error, t('missionError'));
      return;
    }
    toastSuccess(t('expEarned', { count: task.exp_reward }));
    if (updated.level > previousLevel) toastSuccess(t('levelUpShort', { count: updated.level }));
  };

  const editTask = (task: DailyMissionItem) => {
    setEditingID(task.id);
    setTitle(task.title ?? '');
  };

  const deleteTask = async (task: DailyMissionItem) => {
    const saved = await mission.deleteCustomMission(task.id);
    if (!saved) {
      toastError(mission.error, t('missionError'));
      return;
    }
    if (editingID === task.id) {
      setEditingID(null);
      setTitle('');
    }
    toastSuccess(t('customMissionDeleted'));
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-navy">{t('missionProgress', { completed: mission.mission?.completed_count ?? 0, total: 5 })}</p>
        <p className="text-xs font-semibold text-muted-foreground">{t('customMissionCapacity', { count: customCount })}</p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim()) void saveCustom();
        }}
      >
        <Input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder={t('customMissionPlaceholder')} aria-label={t('customMissionLabel')} />
        <Button type="submit" size="sm" disabled={!title.trim() || mission.updatingMissionID !== null}>
          <Plus className="size-4" />{editingID ? t('customMissionSave') : t('customMissionAdd')}
        </Button>
      </form>
      {editingID ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingID(null); setTitle(''); }}>
          {t('customMissionCancelEdit')}
        </Button>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">{t('customMissionPrivacy')}</p>

      {mission.loading && mission.items.length === 0 ? (
        <div className="space-y-2.5" aria-label={t('missionLoading')}>
          {[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : mission.error && mission.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
          <p className="text-sm text-muted-foreground">{t('missionError')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void mission.refetch()}><RefreshCw className="size-3.5" />{t('missionRetry')}</Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {mission.items.map((task) => {
            const presentation = taskPresentation(task, t);
            return (
              <MissionTaskCard
                key={task.id}
                task={task}
                label={presentation.label}
                sourceLabel={task.source === 'custom' ? t('customMissionSource') : t('systemMissionSource')}
                actionLabel={presentation.actionLabel}
                actionHref={presentation.actionHref}
                claimLabel={t('claimExp')}
                claimedLabel={t('expClaimed')}
                selfAttestedLabel={t('customMissionSelfAttested')}
                editLabel={t('customMissionEdit')}
                deleteLabel={t('customMissionDelete')}
                busy={mission.updatingMissionID !== null}
                onClaim={() => void claimTask(task)}
                onEdit={task.source === 'custom' ? () => editTask(task) : undefined}
                onDelete={task.source === 'custom' ? () => void deleteTask(task) : undefined}
              />
            );
          })}
        </div>
      )}
      {!mission.loading && mission.items.length === 0 ? <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground"><Target className="size-4" />{t('missionUnavailable')}</div> : null}
    </div>
  );
}
