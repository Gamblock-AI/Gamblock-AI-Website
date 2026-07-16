'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';
import { useReflections } from '@/hooks/use-reflections';
import { toastError, toastSuccess } from '@/lib/feedback';

export function QuickReflection() {
  const t = useTranslations('recoveryDashboard');
  const [text, setText] = useState('');
  const { createReflection, submitting } = useReflections();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await createReflection(text.trim(), 'Neutral');
      setText('');
      toastSuccess(t('journalSubmit') + ' ✓');
    } catch (err) {
      toastError(err, t('journalError'));
    }
  };

  return (
    <section className="border-t border-navy/15 bg-card/80 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <PenTool className="size-4 text-navy" />
        <h3 id="quick-journal-title" className="text-sm font-bold text-navy">{t('quickJournalTitle')}</h3>
      </div>
      <p className="mt-1 mb-3 text-xs leading-5 text-muted-foreground">{t('quickJournalDesc')}</p>
      
      <form onSubmit={handleSave} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          aria-labelledby="quick-journal-title"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('quickJournalPlaceholder')}
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-navy/35 focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transition-none sm:text-sm"
          disabled={submitting}
        />
        <Button type="submit" disabled={!text.trim() || submitting} className="h-11 w-full px-4 sm:w-auto">
          {submitting ? '...' : t('quickJournalSubmit')}
        </Button>
      </form>
    </section>
  );
}
