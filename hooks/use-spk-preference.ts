'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export interface SpkPreference {
  spk_recommendation_enabled: boolean;
  spk_use_protection: boolean;
  spk_use_recovery: boolean;
  spk_use_personal: boolean;
  llm_personalization_enabled: boolean;
}

export type SpkPreferenceKey = keyof SpkPreference;

export function useSpkPreference() {
  const { data, loading, refetch } = useApiQuery<SpkPreference>(
    '/client/spk-preference'
  );

  const updatePreference = useCallback(
    async (preference: SpkPreference): Promise<boolean> => {
      try {
        await apiClient<SpkPreference>('/client/spk-preference', {
          method: 'PUT',
          body: JSON.stringify({
            spk_recommendation_enabled: preference.spk_recommendation_enabled,
            spk_use_protection: preference.spk_use_protection,
            spk_use_recovery: preference.spk_use_recovery,
            spk_use_personal: preference.spk_use_personal,
            llm_personalization_enabled:
              preference.llm_personalization_enabled,
          }),
        });
        await refetch();
        return true;
      } catch {
        return false;
      }
    },
    [refetch]
  );

  return {
    preference: data,
    loading,
    updatePreference,
  };
}
