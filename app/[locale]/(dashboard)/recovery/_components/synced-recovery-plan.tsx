'use client';

import { type FormEvent, useState } from 'react';
import { Archive, Cloud, RefreshCw, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  type RecoveryRecord,
  type RecoveryRecordKind,
  useRecoveryRecords,
} from '@/hooks/use-recovery-records';
import { toastError, toastSuccess } from '@/lib/feedback';

const DRAFT_KEY = 'gamblock_recovery_record_draft_v1';

export function SyncedRecoveryPlan() {
  const t = useTranslations('recoverySyncV2');
  const recovery = useRecoveryRecords();
  const [editing, setEditing] = useState<RecoveryRecord | null>(null);
  const [kind, setKind] = useState<RecoveryRecordKind>('roadmap');
  const [content, setContent] = useState(readDraft);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');

  const changeContent = (value: string) => {
    setContent(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_KEY, value);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    try {
      await recovery.save({
        id: editing?.id,
        kind,
        record_date: jakartaDate(),
        content: content.trim(),
        status:
          editing?.status === 'archived'
            ? 'active'
            : (editing?.status ?? 'active'),
        metadata:
          kind === 'reminder'
            ? {
                enabled: reminderEnabled,
                local_time: reminderTime,
                timezone: 'Asia/Jakarta',
              }
            : {},
      });
      setEditing(null);
      changeContent('');
      setReminderEnabled(false);
      toastSuccess(t('saved'));
    } catch (error) {
      toastError(error);
    }
  };

  const edit = (record: RecoveryRecord) => {
    setEditing(record);
    setKind(record.kind);
    changeContent(record.content ?? '');
    setReminderEnabled(record.metadata.enabled === true);
    setReminderTime(
      typeof record.metadata.local_time === 'string'
        ? record.metadata.local_time
        : '19:00'
    );
  };

  const archive = async (record: RecoveryRecord) => {
    try {
      await recovery.save({
        id: record.id,
        kind: record.kind,
        record_date: record.record_date,
        content: record.content ?? '',
        status: 'archived',
        metadata: record.metadata,
      });
      toastSuccess(t('archived'));
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <DashboardPanel
      icon={Cloud}
      title={t('title')}
      description={t('body')}
      action={<DashboardStatus tone="sage">{t('encrypted')}</DashboardStatus>}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label
            htmlFor="recovery-record-kind"
            className="text-navy block text-sm font-semibold"
          >
            {t('kindLabel')}
          </label>
          <NativeSelect
            id="recovery-record-kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as RecoveryRecordKind)
            }
          >
            <option value="roadmap">{t('kinds.roadmap')}</option>
            <option value="coping_plan">{t('kinds.coping_plan')}</option>
            <option value="weekly_review">{t('kinds.weekly_review')}</option>
            <option value="practice_log">{t('kinds.practice_log')}</option>
            <option value="saved_resource">{t('kinds.saved_resource')}</option>
            <option value="reminder">{t('kinds.reminder')}</option>
          </NativeSelect>
          <label
            htmlFor="recovery-record-content"
            className="text-navy block text-sm font-semibold"
          >
            {t('contentLabel')}
          </label>
          <Textarea
            id="recovery-record-content"
            value={content}
            maxLength={4000}
            onChange={(event) => changeContent(event.target.value)}
            placeholder={t(`placeholders.${kind}`)}
            className="min-h-32"
            required
          />
          <p className="text-muted-foreground text-xs leading-5">
            {t('draftHelp')}
          </p>
          {kind === 'reminder' ? (
            <div className="border-border rounded-xl border p-4">
              <label className="text-navy flex min-h-11 items-center justify-between gap-4 text-sm font-semibold">
                {t('enableReminder')}
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(event) => setReminderEnabled(event.target.checked)}
                  className="accent-navy size-5"
                />
              </label>
              <label
                htmlFor="reminder-time"
                className="text-muted-foreground mt-3 block text-xs"
              >
                {t('reminderTime')}
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
                disabled={!reminderEnabled}
                className="border-input bg-background focus-visible:ring-navy/20 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={recovery.saving}>
              <Save className="size-4" aria-hidden="true" />
              {editing ? t('update') : t('submit')}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  changeContent('');
                }}
              >
                {t('cancel')}
              </Button>
            ) : null}
          </div>
        </form>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-navy font-bold">{t('historyTitle')}</h3>
            {recovery.error ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void recovery.refetch()}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {t('retry')}
              </Button>
            ) : null}
          </div>
          {recovery.loading ? (
            <p className="text-muted-foreground mt-4 text-sm">{t('loading')}</p>
          ) : recovery.records.length ? (
            <div className="mt-4 space-y-3">
              {recovery.records.map((record) => (
                <article
                  key={record.id}
                  className="border-border rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-navy font-semibold">
                      {t(`kinds.${record.kind}`)}
                    </p>
                    <DashboardStatus
                      tone={record.status === 'archived' ? 'muted' : 'sage'}
                    >
                      {record.status === 'archived'
                        ? t('statusArchived')
                        : t('statusActive')}
                    </DashboardStatus>
                  </div>
                  <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-6 whitespace-pre-wrap">
                    {record.content}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {record.record_date}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => edit(record)}
                    >
                      {t('edit')}
                    </Button>
                    {record.status !== 'archived' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void archive(record)}
                      >
                        <Archive className="size-4" aria-hidden="true" />
                        {t('archive')}
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {t('empty')}
            </p>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}

function readDraft() {
  return typeof window === 'undefined'
    ? ''
    : (window.localStorage.getItem(DRAFT_KEY) ?? '');
}

function jakartaDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return `${value.year}-${value.month}-${value.day}`;
}
