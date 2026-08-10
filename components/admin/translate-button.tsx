'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';
import { toastError, toastSuccess } from '@/lib/feedback';

interface TranslateButtonProps {
  sourceTexts: string[];
  sourceLang: 'id' | 'en';
  targetLang: 'id' | 'en';
  onTranslated: (translations: string[]) => void;
}

export function TranslateButton({
  sourceTexts,
  sourceLang,
  targetLang,
  onTranslated,
}: TranslateButtonProps) {
  const t = useTranslations('shared');
  const { translate, translating } = useTranslate();

  const label =
    targetLang === 'en'
      ? t('adminTranslateToEN')
      : t('adminTranslateToID');

  const nonEmpty = sourceTexts
    .map((s) => String(s ?? '').trim())
    .filter(Boolean);
  const disabled = nonEmpty.length === 0 || translating;

  const handleClick = async () => {
    if (disabled) return;
    const result = await translate(nonEmpty, sourceLang, targetLang);
    if (result && result.length > 0) {
      const mapped = Array.from({ length: sourceTexts.length });
      let resultIndex = 0;
      for (let i = 0; i < sourceTexts.length; i++) {
        if (String(sourceTexts[i] ?? '').trim()) {
          mapped[i] = result[resultIndex++];
        } else {
          mapped[i] = sourceTexts[i];
        }
      }
      onTranslated(mapped as string[]);
      toastSuccess(t(targetLang === 'en' ? 'adminTranslatedToEN' : 'adminTranslatedToID'));
    } else if (!translating) {
      toastError(t('adminTranslateFailed'));
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={handleClick}
      className="gap-1.5 rounded-xl text-xs"
    >
      {translating ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />
          {t('adminTranslating')}
        </>
      ) : (
        <>
          <Languages className="text-navy size-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
