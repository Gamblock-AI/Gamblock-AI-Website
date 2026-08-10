'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiQuery } from './use-api';

export interface SpkFeature {
  intervention_key: string;
  response_type: string;
  feature_id: string;
  category: string;
  route: string;
  action: string;
  load: number;
}

export interface SpkTimeTrigger {
  has_time_pattern: boolean;
  pattern_start?: string;
  pattern_end?: string;
  trigger_start?: string;
  trigger_end?: string;
}

export interface SpkReasonFactor {
  key: string;
  score: number;
  weight_percent: number;
}

export interface SpkReason {
  code: string;
  support_level: 'LOW' | 'MEDIUM' | 'HIGH';
  engagement_level: 'HIGH' | 'MEDIUM' | 'LOW';
  support_score: number;
  factors: SpkReasonFactor[];
}

export interface SpkDataGap {
  key: string;
  action: string;
  route?: string;
}

export interface SpkRecommendation {
  recommendation_id: string;
  recommended_at: string;
  recommendation_enabled: boolean;
  feature: SpkFeature;
  support_level: 'LOW' | 'MEDIUM' | 'HIGH';
  support_score: number;
  engagement_level: 'HIGH' | 'MEDIUM' | 'LOW';
  intervention_needed: boolean;
  reason_code: string;
  reason: SpkReason;
  time_trigger?: SpkTimeTrigger | null;
  effectiveness_history_used: boolean;
  triggered_rules?: string[];
  data_state: 'sufficient' | 'partial' | 'insufficient';
  data_gaps?: SpkDataGap[];
  available_weight_percent: number;
  unavailable_fields?: string[];
  personalized_message?: string;
  personalized_explanation?: string;
  llm_used: boolean;
}

export function useSpkRecommendation() {
  const { data, loading, error, refetch } =
    useApiQuery<SpkRecommendation>('/client/spk-recommendation');
  const [completing, setCompleting] = useState(false);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const markCompleted = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      setCompleting(true);
      try {
        await apiClient(`/client/spk-interventions/${recommendationId}/complete`, {
          method: 'POST',
        });
        setCompletedId(recommendationId);
        return true;
      } finally {
        setCompleting(false);
      }
    },
    []
  );

  return {
    recommendation: data,
    loading,
    error,
    refetch,
    markCompleted,
    completing,
    completedId,
  };
}
