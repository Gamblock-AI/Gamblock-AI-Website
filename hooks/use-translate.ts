'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { friendlyMessage } from '@/lib/messages';

interface TranslateResult {
  translations: string[];
}

export function useTranslate() {
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const translate = useCallback(
    async (
      texts: string[],
      sourceLang: 'id' | 'en',
      targetLang: 'id' | 'en'
    ): Promise<string[] | null> => {
      const filtered = texts.map((t) => t.trim()).filter(Boolean);
      if (filtered.length === 0) return null;

      setTranslating(true);
      setTranslateError(null);
      try {
        const result = await apiClient<TranslateResult>('/admin/translate', {
          method: 'POST',
          body: JSON.stringify({
            texts: filtered,
            source_lang: sourceLang,
            target_lang: targetLang,
          }),
        });
        return result?.translations ?? null;
      } catch (err: unknown) {
        const message = friendlyMessage(err);
        setTranslateError(message);
        return null;
      } finally {
        setTranslating(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setTranslateError(null), []);

  return { translate, translating, translateError, clearError };
}
