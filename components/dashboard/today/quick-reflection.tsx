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
      await createReflection({ text: text.trim() });
      setText('');
      toastSuccess(t('journalSubmit') + ' ✓');
    } catch (err) {
      toastError(err, t('journalError'));
    }
  };

  return (
    <section className="bg-card/80 h-full px-5 py-4">
      <div className="flex items-center gap-2">
        <PenTool className="text-navy size-4" />
        <h3 id="quick-journal-title" className="text-navy text-sm font-bold">
          {t('quickJournalTitle')}
        </h3>
      </div>
      <p className="text-muted-foreground mt-1 mb-3 text-xs leading-5">
        {t('quickJournalDesc')}
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          aria-labelledby="quick-journal-title"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('quickJournalPlaceholder')}
          className="border-input bg-card focus-visible:border-navy/35 focus-visible:ring-navy/35 h-11 min-w-0 flex-1 rounded-xl border px-3 text-base transition-[border-color,box-shadow] duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none sm:text-sm"
          disabled={submitting}
        />
        <Button
          type="submit"
          disabled={!text.trim() || submitting}
          className="h-11 w-full px-4 sm:w-auto"
        >
          {submitting ? '...' : t('quickJournalSubmit')}
        </Button>
      </form>
    </section>
  );
}
