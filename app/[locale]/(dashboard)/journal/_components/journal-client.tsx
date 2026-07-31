'use client';

import { useState } from 'react';
import { BookHeart, Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { JournalTextEditor } from '@/components/education/journal-text-editor';
import { DashboardPage, DashboardPageHeader } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useDailyJournal, type JournalDocument } from '@/hooks/use-daily-journal';
import { toastError, toastSuccess } from '@/lib/feedback';

const emptyDocument: JournalDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

function textFromDocument(value: JournalDocument) {
  const collect = (node: unknown): string[] => {
    if (!node || typeof node !== 'object') return [];
    const item = node as { text?: unknown; content?: unknown };
    return [typeof item.text === 'string' ? item.text : '', ...(Array.isArray(item.content) ? item.content.flatMap(collect) : [])];
  };
  return collect(value).join(' ').replace(/\s+/g, ' ').trim();
}

export function JournalClient() {
  const t = useTranslations('recoveryHub');
  const locale = useLocale();
  const journal = useDailyJournal();
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date());
  return <DashboardPage density="compact">
    <DashboardPageHeader icon={BookHeart} eyebrow={t('dailyJournalEyebrow')} title={t('dailyJournalTitle')} description={t('dailyJournalDescription')} />
    <section className="border-border bg-card shadow-soft rounded-2xl border p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-navy text-lg font-bold">{t('dailyJournalToday')}</h2>
        <p className="text-muted-foreground text-sm">{date}</p>
      </div>
      <JournalComposer key={journal.entry?.id ?? 'new'} initialDocument={journal.entry?.document ?? emptyDocument} saving={journal.saving} loading={journal.loading} onSave={journal.save} labels={{ undo: t('editorUndo'), redo: t('editorRedo'), heading: t('editorHeading'), bold: t('editorBold'), italic: t('editorItalic'), bulletList: t('editorBulletList'), orderedList: t('editorOrderedList'), quote: t('dailyJournalQuote'), image: t('dailyJournalImage'), placeholder: t('dailyJournalPlaceholder') }} saveLabel={t('dailyJournalSave')} savingLabel={t('dailyJournalSaving')} successLabel={t('dailyJournalSaved')} errorLabel={t('dailyJournalSaveError')} />
    </section>
    <section className="border-border bg-card shadow-soft rounded-2xl border p-4 sm:p-5">
      <h2 className="text-navy text-lg font-bold">{t('dailyJournalHistory')}</h2>
      {journal.history.length === 0 ? <p className="text-muted-foreground mt-2 text-sm leading-6">{t('dailyJournalEmpty')}</p> : <ol className="border-border mt-3 divide-y border-t">{journal.history.map((entry) => <li key={entry.id} className="py-3"><p className="text-navy text-sm font-semibold">{entry.journal_date}</p><p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{textFromDocument(entry.document) || t('dailyJournalImageOnly')}</p></li>)}</ol>}
    </section>
  </DashboardPage>;
}

function JournalComposer({ initialDocument, saving, loading, onSave, labels, saveLabel, savingLabel, successLabel, errorLabel }: { initialDocument: JournalDocument; saving: boolean; loading: boolean; onSave: (document: JournalDocument) => Promise<void>; labels: Record<string, string>; saveLabel: string; savingLabel: string; successLabel: string; errorLabel: string }) {
  const [document, setDocument] = useState<JournalDocument>(initialDocument);
  const save = async () => { try { await onSave(document); toastSuccess(successLabel); } catch (error) { toastError(error, errorLabel); } };
  return <><JournalTextEditor value={document} onChange={setDocument} labels={labels} /><div className="mt-4 flex justify-end"><Button size="lg" disabled={saving || loading} onClick={() => void save()}><Save className="size-4" />{saving ? savingLabel : saveLabel}</Button></div></>;
}
