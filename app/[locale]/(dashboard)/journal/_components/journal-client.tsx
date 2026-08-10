'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  BookHeart,
  Calendar,
  History,
  ImageIcon,
  Lock,
  PenLine,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { JournalTextEditor } from '@/components/education/journal-text-editor';
import {
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useDailyJournal,
  type DailyJournalEntry,
  type JournalDocument,
} from '@/hooks/use-daily-journal';
import { toastError, toastSuccess } from '@/lib/feedback';

const emptyDocument: JournalDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function textFromDocument(value: JournalDocument) {
  const collect = (node: unknown): string[] => {
    if (!node || typeof node !== 'object') return [];
    const item = node as { text?: unknown; content?: unknown };
    return [
      typeof item.text === 'string' ? item.text : '',
      ...(Array.isArray(item.content) ? item.content.flatMap(collect) : []),
    ];
  };
  return collect(value).join(' ').replace(/\s+/g, ' ').trim();
}

function countDocumentImages(value: JournalDocument) {
  const collect = (node: unknown): number => {
    if (!node || typeof node !== 'object') return 0;
    const item = node as { type?: unknown; content?: unknown };
    const count = item.type === 'image' ? 1 : 0;
    return (
      count +
      (Array.isArray(item.content)
        ? item.content.reduce((acc, child) => acc + collect(child), 0)
        : 0)
    );
  };
  return collect(value);
}

export function JournalClient() {
  const t = useTranslations('recoveryHub');
  const locale = useLocale();
  const journal = useDailyJournal();
  const [selectedEntry, setSelectedEntry] = useState<DailyJournalEntry | null>(
    null
  );

  const formattedToday = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <DashboardPage density="compact">
      <DashboardPageHeader
        icon={BookHeart}
        eyebrow={t('dailyJournalEyebrow')}
        title={t('dailyJournalTitle')}
        description={t('dailyJournalDescription')}
        aside={
          <div className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-azure/50 px-3 py-1 text-xs font-bold text-navy shadow-2xs">
            <Lock className="size-3.5 text-navy" />
            <span>{t('dailyJournalEncryptedBadge')}</span>
          </div>
        }
      />

      {/* Card 1: Entri Hari Ini */}
      <section
        className="border-border bg-card shadow-soft rounded-[1.5rem] border p-5 sm:p-6"
        aria-labelledby="today-entry-heading"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-azure/70 text-navy flex items-center justify-center border border-navy/10 shadow-2xs shrink-0">
              <PenLine className="size-5" />
            </div>
            <div>
              <h2
                id="today-entry-heading"
                className="text-navy text-lg sm:text-xl font-bold"
              >
                {t('dailyJournalToday')}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('dailyJournalDescription')}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border/80 px-3.5 py-1 text-xs font-semibold text-navy shrink-0 self-start sm:self-auto">
            <Calendar className="size-3.5 text-navy/70" />
            <span>{formattedToday}</span>
          </div>
        </div>

        <JournalComposer
          key={journal.entry?.id ?? 'new'}
          initialDocument={journal.entry?.document ?? emptyDocument}
          saving={journal.saving}
          loading={journal.loading}
          onSave={journal.save}
          labels={{
            undo: t('editorUndo'),
            redo: t('editorRedo'),
            heading: t('editorHeading'),
            bold: t('editorBold'),
            italic: t('editorItalic'),
            bulletList: t('editorBulletList'),
            orderedList: t('editorOrderedList'),
            quote: t('dailyJournalQuote'),
            image: t('dailyJournalImage'),
            placeholder: t('dailyJournalPlaceholder'),
          }}
          saveLabel={t('dailyJournalSave')}
          savingLabel={t('dailyJournalSaving')}
          successLabel={t('dailyJournalSaved')}
          errorLabel={t('dailyJournalSaveError')}
          privacyHint={t('dailyJournalPrivateBody')}
        />
      </section>

      {/* Card 2: Riwayat Jurnal */}
      <section
        className="border-border bg-card shadow-soft rounded-[1.5rem] border p-5 sm:p-6"
        aria-labelledby="journal-history-heading"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-azure/70 text-navy flex items-center justify-center border border-navy/10 shadow-2xs shrink-0">
              <History className="size-5" />
            </div>
            <div>
              <h2
                id="journal-history-heading"
                className="text-navy text-lg sm:text-xl font-bold"
              >
                {t('dailyJournalHistory')}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('dailyJournalPrivateTitle')} · {t('dailyJournalPrivateBody')}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-azure/60 border border-navy/10 px-3 py-1 text-xs font-bold text-navy shrink-0 self-start sm:self-auto">
            {t('dailyJournalEntriesCount', { count: journal.history.length })}
          </span>
        </div>

        {journal.history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-14 rounded-2xl bg-azure/50 border border-navy/10 text-navy flex items-center justify-center mb-3 shadow-2xs">
              <BookHeart className="size-7 text-navy-light" />
            </div>
            <p className="text-navy font-bold text-base">
              {t('dailyJournalEmpty')}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-sm">
              {t('dailyJournalPlaceholder')}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {journal.history.map((entry) => {
              const text = textFromDocument(entry.document);
              const words = text ? text.trim().split(/\s+/).length : 0;
              const imageCount = countDocumentImages(entry.document);
              const isToday =
                entry.journal_date === new Date().toISOString().slice(0, 10);
              const formattedDate = new Intl.DateTimeFormat(locale, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(new Date(`${entry.journal_date}T12:00:00`));

              return (
                <div
                  key={entry.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/15 p-4 sm:p-5 transition-all duration-200 hover:border-navy/30 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-navy-light" />
                        <span className="text-sm font-bold text-navy">
                          {formattedDate}
                        </span>
                      </div>
                      {isToday ? (
                        <span className="inline-flex items-center rounded-full bg-navy px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                          {t('dailyJournalToday')}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {text || t('dailyJournalImageOnly')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground/80 font-semibold">
                      {text ? (
                        <span>{t('dailyJournalWords', { count: words })}</span>
                      ) : null}
                      {imageCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-navy-light bg-azure/50 px-2 py-0.5 rounded-md">
                          <ImageIcon className="size-3" />
                          <span>{imageCount}</span>
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className="inline-flex items-center gap-1 font-bold text-navy hover:text-navy-light transition-colors cursor-pointer group/btn"
                    >
                      <span>{t('dailyJournalReadMore')}</span>
                      <ArrowUpRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Entry Reader Dialog */}
      {selectedEntry ? (
        <JournalDetailDialog
          entry={selectedEntry}
          locale={locale}
          onClose={() => setSelectedEntry(null)}
        />
      ) : null}
    </DashboardPage>
  );
}

function JournalComposer({
  initialDocument,
  saving,
  loading,
  onSave,
  labels,
  saveLabel,
  savingLabel,
  successLabel,
  errorLabel,
  privacyHint,
}: {
  initialDocument: JournalDocument;
  saving: boolean;
  loading: boolean;
  onSave: (document: JournalDocument) => Promise<void>;
  labels: Record<string, string>;
  saveLabel: string;
  savingLabel: string;
  successLabel: string;
  errorLabel: string;
  privacyHint: string;
}) {
  const [document, setDocument] = useState<JournalDocument>(initialDocument);

  const save = async () => {
    try {
      await onSave(document);
      toastSuccess(successLabel);
    } catch (error) {
      toastError(error, errorLabel);
    }
  };

  return (
    <>
      <JournalTextEditor
        value={document}
        onChange={setDocument}
        labels={labels}
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-sage shrink-0" />
          <span>{privacyHint}</span>
        </div>
        <Button
          size="lg"
          className="rounded-xl font-bold shadow-sm cursor-pointer"
          disabled={saving || loading}
          onClick={() => void save()}
        >
          <Save className="size-4" />
          {saving ? savingLabel : saveLabel}
        </Button>
      </div>
    </>
  );
}

function JournalDetailDialog({
  entry,
  locale,
  onClose,
}: {
  entry: DailyJournalEntry;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations('recoveryHub');
  const text = textFromDocument(entry.document);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
  }).format(new Date(`${entry.journal_date}T12:00:00`));

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
              {t('dailyJournalDetailTitle')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-azure/50 px-2 py-0.5 text-[10px] font-bold text-navy">
              <Lock className="size-3" />
              {t('dailyJournalEncryptedBadge')}
            </span>
          </div>
          <DialogTitle className="text-navy text-lg sm:text-xl font-bold">
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 rounded-2xl bg-muted/20 border border-border/70 p-4 sm:p-5">
          {text ? (
            <p className="whitespace-pre-wrap text-foreground text-sm sm:text-base leading-relaxed">
              {text}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              {t('dailyJournalImageOnly')}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('dailyJournalClose')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
