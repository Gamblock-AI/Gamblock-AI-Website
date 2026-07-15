'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface EducationModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  estimated_minutes: number;
  progress: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Education request failed');
}

export function useEducationModules() {
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<EducationModule[]>('/psychoeducation/modules');
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setModules((response ?? []).filter((module) => module.status === 'published'));
    } catch (requestError) {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setError(toError(requestError));
    } finally {
      if (mountedRef.current && requestId === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const requestId = ++requestRef.current;
    void apiClient<EducationModule[]>('/psychoeducation/modules').then(
      (response) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        setModules((response ?? []).filter((module) => module.status === 'published'));
        setError(null);
        setLoading(false);
      },
      (requestError: unknown) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        setError(toError(requestError));
        setLoading(false);
      },
    );
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, []);

  return { modules, loading, error, refetch: load };
}

export function useEducationModule(slug: string) {
  const [module, setModule] = useState<EducationModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!slug) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<EducationModule>(
        `/psychoeducation/modules/${encodeURIComponent(slug)}`,
      );
      if (!mountedRef.current || requestId !== requestRef.current) return;
      if (response.status !== 'published') {
        setModule(null);
        setError(new Error('Module is not published'));
        return;
      }
      setModule(response);
    } catch (requestError) {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setError(toError(requestError));
    } finally {
      if (mountedRef.current && requestId === requestRef.current) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    mountedRef.current = true;
    if (!slug) {
      return () => {
        mountedRef.current = false;
      };
    }

    const requestId = ++requestRef.current;
    void apiClient<EducationModule>(
      `/psychoeducation/modules/${encodeURIComponent(slug)}`,
    ).then(
      (response) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        if (response.status !== 'published') {
          setModule(null);
          setError(new Error('Module is not published'));
          setLoading(false);
          return;
        }
        setModule(response);
        setError(null);
        setLoading(false);
      },
      (requestError: unknown) => {
        if (!mountedRef.current || requestId !== requestRef.current) return;
        setError(toError(requestError));
        setLoading(false);
      },
    );
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, [slug]);

  return { module, loading, error, refetch: load };
}
