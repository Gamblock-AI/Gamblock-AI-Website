'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface AdminSupportCase {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  owner?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminEducationModule {
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimated_minutes: number;
  status: string;
}

export interface AdminModelRelease {
  id: string;
  version: string;
  platform: string;
  sha256?: string;
  status: string;
  published_at_text?: string;
}

interface AdminOperationsState {
  modules: AdminEducationModule[];
  releases: AdminModelRelease[];
  cases: AdminSupportCase[];
}

const EMPTY_STATE: AdminOperationsState = {
  modules: [],
  releases: [],
  cases: [],
};

export function useAdminOperations() {
  const [data, setData] = useState<AdminOperationsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [emergencyKey, setEmergencyKey] = useState<string | null>(null);
  const [emergencyKeyMeta, setEmergencyKeyMeta] = useState<{
    expiresIn?: string;
    singleUse?: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [modules, releases, cases] = await Promise.all([
        apiClient<AdminEducationModule[]>('/admin/content/modules'),
        apiClient<AdminModelRelease[]>('/admin/model-releases'),
        apiClient<AdminSupportCase[]>('/admin/support-cases'),
      ]);
      setData({
        modules: modules ?? [],
        releases: releases ?? [],
        cases: cases ?? [],
      });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient<AdminEducationModule[]>('/admin/content/modules'),
      apiClient<AdminModelRelease[]>('/admin/model-releases'),
      apiClient<AdminSupportCase[]>('/admin/support-cases'),
    ])
      .then(([modules, releases, cases]) => {
        if (!active) return;
        setData({
          modules: modules ?? [],
          releases: releases ?? [],
          cases: cases ?? [],
        });
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const generateEmergencyKey = useCallback(async () => {
    setKeyLoading(true);
    try {
      const result = await apiClient<{
        emergency_key: string;
        expires_in?: string;
        single_use?: boolean;
      }>(
        '/admin/emergency-key',
        { method: 'POST' },
      );
      setEmergencyKey(result.emergency_key);
      setEmergencyKeyMeta({
        expiresIn: result.expires_in,
        singleUse: result.single_use,
      });
      return result.emergency_key;
    } finally {
      setKeyLoading(false);
    }
  }, []);

  return {
    ...data,
    loading,
    error,
    refetch: load,
    keyLoading,
    emergencyKey,
    emergencyKeyMeta,
    generateEmergencyKey,
  };
}
