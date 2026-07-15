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
    <section className="border-t border-border bg-white px-5 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <PenTool className="size-4 text-navy" />
        <h3 className="text-sm font-bold text-navy">{t('quickJournalTitle')}</h3>
      </div>
      <p className="mt-1 mb-3 text-xs leading-5 text-muted-foreground">{t('quickJournalDesc')}</p>
      
      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('quickJournalPlaceholder')}
          className="h-10 flex-1 rounded-xl border border-input px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
          disabled={submitting}
        />
        <Button type="submit" disabled={!text.trim() || submitting} className="h-10 px-4">
          {submitting ? '...' : t('quickJournalSubmit')}
        </Button>
      </form>
    </section>
  );
}
