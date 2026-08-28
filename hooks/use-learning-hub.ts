'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import { usePaginatedQuery } from './use-paginated-query';
import type { PaginatedData } from './use-pagination';

export interface LearningCluster {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface AcademicProgram {
  id: string;
  institution_id: string;
  slug: string;
  name: string;
  degree: string;
  primary_cluster_slug: string;
  sort_order: number;
}

export interface LearningProgress {
  item_id: string;
  state: 'saved' | 'started' | 'completed';
  completed_at?: string;
}

export interface LearningItem {
  id: string;
  slug: string;
  kind:
    | 'course'
    | 'certification'
    | 'learning_path'
    | 'mini_project'
    | 'career_snapshot'
    | 'toolkit'
    | 'opportunity';
  title: string;
  summary: string;
  provider?: string;
  provider_description?: string;
  url?: string;
  provider_logo_url?: string;
  thumbnail_url?: string;
  cost?: string;
  certificate?: string;
  language?: string[];
  difficulty?: string;
  duration_minutes?: number;
  outcomes?: string[];
  prerequisites?: string;
  clusters?: string[];
  programs?: string[];
  career_snapshot?: string;
  reviewed_at?: string;
  steps?: string[];
  projects?: string[];
  progress?: LearningProgress;
}

export interface LearningExperience {
  total_exp: number;
  level: number;
  level_progress: number;
  level_target: number;
}

export interface LearningCatalog {
  clusters: LearningCluster[];
  programs: AcademicProgram[];
  items: LearningItem[];
  progress: LearningProgress[];
  experience: LearningExperience;
}

export interface LearningProvider {
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  count: number;
}

export interface LearningItemsPage extends PaginatedData<LearningItem> {
  provider?: LearningProvider;
}

export function useLearningHubProviders(locale: string, query = '') {
  const params = new URLSearchParams({ locale });
  if (query.trim()) params.set('q', query.trim());
  return usePaginatedQuery<LearningProvider>({
    path: `/learning-hub/providers?${params.toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.skillsProviders,
    pageSize: 9,
  });
}

export function useLearningHubItems(locale: string, providerSlug: string) {
  const params = new URLSearchParams({ locale, provider: providerSlug });
  return usePaginatedQuery<LearningItem, LearningItemsPage>({
    path: `/learning-hub/items?${params.toString()}`,
    pageKey: DASHBOARD_QUERY_KEYS.pages.skillsItems,
    pageSize: 9,
  });
}

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error('Learning Hub request failed');
}

export function useLearningHub(locale: string) {
  const [catalog, setCatalog] = useState<LearningCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [savingID, setSavingID] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient<LearningCatalog>(
        `/learning-hub/catalog?locale=${encodeURIComponent(locale)}`
      );
      setCatalog(result);
    } catch (requestError) {
      setError(toError(requestError));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    // The initial fetch synchronizes this client hook with the API catalog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  const updateState = useCallback(
    async (itemID: string, state: 'saved' | 'started') => {
      setSavingID(itemID);
      try {
        const progress = await apiClient<LearningProgress>(
          `/learning-hub/items/${encodeURIComponent(itemID)}/state`,
          { method: 'PUT', body: JSON.stringify({ state }) }
        );
        setCatalog((current) => {
          if (!current) return current;
          const items = current.items.map((item) =>
            item.id === itemID ? { ...item, progress } : item
          );
          const existing = current.progress.filter(
            (item) => item.item_id !== itemID
          );
          return { ...current, items, progress: [...existing, progress] };
        });
        return progress;
      } catch (requestError) {
        setError(toError(requestError));
        throw requestError;
      } finally {
        setSavingID(null);
      }
    },
    []
  );

  const checkpoint = useCallback(
    async (itemID: string, reflection: string, outcome: string) => {
      setSavingID(itemID);
      try {
        const result = await apiClient<{
          progress: LearningProgress;
          exp_granted: boolean;
          cap_reached: boolean;
          experience: LearningExperience;
        }>(`/learning-hub/items/${encodeURIComponent(itemID)}/checkpoint`, {
          method: 'POST',
          body: JSON.stringify({ reflection, outcome }),
        });
        setCatalog((current) => {
          if (!current) return current;
          const items = current.items.map((item) =>
            item.id === itemID ? { ...item, progress: result.progress } : item
          );
          const existing = current.progress.filter(
            (item) => item.item_id !== itemID
          );
          return {
            ...current,
            items,
            progress: [...existing, result.progress],
            experience: result.experience,
          };
        });
        return result;
      } catch (requestError) {
        setError(toError(requestError));
        throw requestError;
      } finally {
        setSavingID(null);
      }
    },
    []
  );

  return {
    catalog,
    loading,
    error,
    savingID,
    refetch,
    updateState,
    checkpoint,
  };
}
