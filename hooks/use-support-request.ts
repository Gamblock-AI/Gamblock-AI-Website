'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function useSupportRequest() {
  const [submitting, setSubmitting] = useState(false);

  const createCase = useCallback(
    async ({
      summary,
      priority,
      type,
    }: {
      summary: string;
      priority: string;
      type: string;
    }) => {
      setSubmitting(true);
      try {
        await apiClient('/support-cases', {
          method: 'POST',
          body: JSON.stringify({ summary, priority, type }),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, createCase };
}
