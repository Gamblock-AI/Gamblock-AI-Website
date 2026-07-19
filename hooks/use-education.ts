'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export type RichTextDocument = {
  type?: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: RichTextDocument[];
};

export interface EducationChoice {
  id: string;
  text: string;
}

export interface EducationKnowledgeCheck {
  id: string;
  question: string;
  choices: EducationChoice[];
  explanation?: string;
  required: boolean;
}

export interface EducationSection {
  id: string;
  sort_order: number;
  required: boolean;
  title: string;
  content: RichTextDocument;
  knowledge_check?: EducationKnowledgeCheck;
}

export interface EducationThumbnail {
  media_id: string;
  sort_order: number;
  alt_text: Record<string, string>;
}

export interface EducationSource {
  title: string;
  publisher: string;
  url: string;
  published_at?: string;
  accessed_at: string;
}

export interface EducationProgress {
  completed_section_ids: string[];
  opened_media_ids: string[];
  correct_check_ids: string[];
  progress_percent: number;
  completed_at?: string;
}

export interface EducationModule {
  id: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  learning_objective: string;
  disclaimer: string;
  category: string;
  audience: 'student' | 'partner' | 'all';
  experience_type: 'article' | 'partner_response_simulator';
  estimated_minutes: number;
  reviewer_name: string;
  reviewer_role: string;
  reviewed_at: string;
  revision: number;
  thumbnails: EducationThumbnail[];
  thumbnail_urls: Record<string, string>;
  media_urls: Record<string, string>;
  sources: EducationSource[];
  sections: EducationSection[];
  progress: EducationProgress;
  updated_at: string;
}

export interface EducationCheckResult {
  correct: boolean;
  explanation: string;
  progress: EducationProgress;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Education request failed');
}

function normalizeEducationProgress(
  progress: EducationProgress | null | undefined
): EducationProgress {
  return {
    ...(progress ?? {}),
    completed_section_ids: Array.isArray(progress?.completed_section_ids)
      ? progress.completed_section_ids
      : [],
    opened_media_ids: Array.isArray(progress?.opened_media_ids)
      ? progress.opened_media_ids
      : [],
    correct_check_ids: Array.isArray(progress?.correct_check_ids)
      ? progress.correct_check_ids
      : [],
    progress_percent:
      typeof progress?.progress_percent === 'number' &&
      Number.isFinite(progress.progress_percent)
        ? progress.progress_percent
        : 0,
  };
}

function normalizeEducationModule(module: EducationModule): EducationModule {
  return {
    ...module,
    thumbnails: Array.isArray(module.thumbnails) ? module.thumbnails : [],
    thumbnail_urls: module.thumbnail_urls ?? {},
    media_urls: module.media_urls ?? {},
    sources: Array.isArray(module.sources) ? module.sources : [],
    sections: Array.isArray(module.sections) ? module.sections : [],
    progress: normalizeEducationProgress(module.progress),
  };
}

function normalizeEducationModules(modules: EducationModule[]) {
  return Array.isArray(modules) ? modules.map(normalizeEducationModule) : [];
}

function useEducationRequest<T>(
  path: string | null,
  normalize?: (response: T) => T
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [refreshingPath, setRefreshingPath] = useState<string | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const requestId = ++requestRef.current;
    setRefreshingPath(path);
    setError(null);
    try {
      const response = await apiClient<T>(path);
      if (requestId === requestRef.current) {
        setData(normalize ? normalize(response) : response);
      }
    } catch (requestError) {
      if (requestId === requestRef.current) setError(toError(requestError));
    } finally {
      if (requestId === requestRef.current) {
        setResolvedPath(path);
        setRefreshingPath(null);
      }
    }
  }, [normalize, path]);

  useEffect(() => {
    if (!path) return;
    const requestId = ++requestRef.current;
    void apiClient<T>(path).then(
      (response) => {
        if (requestId !== requestRef.current) return;
        setData(normalize ? normalize(response) : response);
        setError(null);
        setResolvedPath(path);
      },
      (requestError: unknown) => {
        if (requestId !== requestRef.current) return;
        setError(toError(requestError));
        setResolvedPath(path);
      }
    );
    return () => {
      requestRef.current += 1;
    };
  }, [normalize, path]);

  const pathResolved = resolvedPath === path;
  return {
    data: pathResolved ? data : null,
    setData,
    loading: Boolean(path && !pathResolved) || refreshingPath === path,
    error: pathResolved ? error : null,
    refetch: load,
  };
}

export function useEducationModules(locale: string, enabled = true) {
  const result = useEducationRequest<EducationModule[]>(
    enabled
      ? `/psychoeducation/modules?locale=${encodeURIComponent(locale)}`
      : null,
    normalizeEducationModules
  );
  return { modules: result.data ?? [], ...result };
}

export function useEducationModule(slug: string, locale: string) {
  const result = useEducationRequest<EducationModule>(
    slug
      ? `/psychoeducation/modules/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`
      : null,
    normalizeEducationModule
  );

  const updateProgress = useCallback(
    async (completedSectionIDs: string[], openedMediaIDs: string[]) => {
      if (!result.data) return null;
      const response = await apiClient<EducationProgress>(
        `/psychoeducation/modules/${result.data.id}/revisions/${result.data.revision}/progress`,
        {
          method: 'PUT',
          body: JSON.stringify({
            completed_section_ids: completedSectionIDs,
            opened_media_ids: openedMediaIDs,
          }),
        }
      );
      const progress = normalizeEducationProgress(response);
      result.setData((current) =>
        current ? { ...current, progress } : current
      );
      return progress;
    },
    [result]
  );

  const answerCheck = useCallback(
    async (checkID: string, choiceID: string) => {
      if (!result.data) throw new Error('Module unavailable');
      const response = await apiClient<EducationCheckResult>(
        `/psychoeducation/modules/${result.data.id}/revisions/${result.data.revision}/checks/${checkID}/answer?locale=${encodeURIComponent(locale)}`,
        { method: 'POST', body: JSON.stringify({ choice_id: choiceID }) }
      );
      const answer = {
        ...response,
        progress: normalizeEducationProgress(response.progress),
      };
      result.setData((current) =>
        current ? { ...current, progress: answer.progress } : current
      );
      return answer;
    },
    [locale, result]
  );

  return { module: result.data, ...result, updateProgress, answerCheck };
}
