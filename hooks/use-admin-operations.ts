'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  contract_version?: string;
  threshold?: number;
  status: string;
  published_at_text?: string;
}

export interface EmergencyKeyRequest {
  id: string;
  requested_by: string;
  device_id: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  status: string;
  request_expires_at: string;
  key_expires_at?: string;
  created_at: string;
}

export interface AdminCapabilities {
  content: boolean;
  releases: boolean;
  support: boolean;
  emergency: boolean;
}

export interface AdminModuleDraft {
  title: string;
  slug: string;
  summary: string;
  body_markdown: string;
  estimated_minutes: number;
}

export interface AdminModelReleaseDraft {
  version: string;
  platform: string;
  artifact_path: string;
  sha256: string;
  contract_version: string;
  threshold: string;
}

interface AdminOperationsState {
  modules: AdminEducationModule[];
  releases: AdminModelRelease[];
  cases: AdminSupportCase[];
  emergencyRequests: EmergencyKeyRequest[];
}

const EMPTY_STATE: AdminOperationsState = {
  modules: [],
  releases: [],
  cases: [],
  emergencyRequests: [],
};

async function fetchAdminOperations(
  capabilities: AdminCapabilities
): Promise<AdminOperationsState> {
  const [modules, releases, cases, emergencyRequests] = await Promise.all([
    capabilities.content
      ? apiClient<AdminEducationModule[]>('/admin/content/modules')
      : Promise.resolve([]),
    capabilities.releases
      ? apiClient<AdminModelRelease[]>('/admin/model-releases')
      : Promise.resolve([]),
    capabilities.support
      ? apiClient<AdminSupportCase[]>('/admin/support-cases')
      : Promise.resolve([]),
    capabilities.emergency
      ? apiClient<EmergencyKeyRequest[]>('/admin/emergency-key-requests')
      : Promise.resolve([]),
  ]);

  return {
    modules: modules ?? [],
    releases: releases ?? [],
    cases: cases ?? [],
    emergencyRequests: emergencyRequests ?? [],
  };
}

export function getAdminCapabilities(role?: string): AdminCapabilities {
  return {
    content: role === 'content_admin' || role === 'platform_admin',
    releases: role === 'model_release_operator' || role === 'platform_admin',
    support: role === 'support_operator' || role === 'platform_admin',
    emergency: role === 'platform_admin',
  };
}

export function useAdminOperations(role?: string) {
  const capabilities = useMemo(() => getAdminCapabilities(role), [role]);
  const [data, setData] = useState<AdminOperationsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(Boolean(role));
  const [error, setError] = useState<unknown>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [emergencyKey, setEmergencyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!role) {
      setData(EMPTY_STATE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminOperations(capabilities));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [capabilities, role]);

  useEffect(() => {
    if (!role) return;

    let active = true;
    void fetchAdminOperations(capabilities)
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [capabilities, role]);

  const approveEmergencyKey = useCallback(
    async (requestID: string) => {
      setKeyLoading(true);
      try {
        const result = await apiClient<{
          request: EmergencyKeyRequest;
          emergency_key: string;
          expires_in: string;
          single_use: boolean;
        }>(`/admin/emergency-key-requests/${requestID}/approve`, {
          method: 'POST',
        });
        setEmergencyKey(result.emergency_key);
        await load();
        return result.emergency_key;
      } finally {
        setKeyLoading(false);
      }
    },
    [load]
  );

  const reviewEmergencyKey = useCallback(
    async (requestID: string) => {
      setKeyLoading(true);
      try {
        await apiClient<EmergencyKeyRequest>(
          `/admin/emergency-key-requests/${requestID}/review`,
          { method: 'POST' }
        );
        await load();
      } finally {
        setKeyLoading(false);
      }
    },
    [load]
  );

  const createModule = useCallback(
    async (module: AdminModuleDraft) => {
      await apiClient('/admin/content/modules', {
        method: 'POST',
        body: JSON.stringify(module),
      });
      await load();
    },
    [load]
  );

  const createModelRelease = useCallback(
    async (release: AdminModelReleaseDraft) => {
      await apiClient('/releases/model', {
        method: 'POST',
        body: JSON.stringify({
          ...release,
          threshold: Number(release.threshold),
          metrics: {},
        }),
      });
      await load();
    },
    [load]
  );

  return {
    ...data,
    capabilities,
    loading,
    error,
    refetch: load,
    keyLoading,
    emergencyKey,
    clearEmergencyKey: () => setEmergencyKey(null),
    reviewEmergencyKey,
    approveEmergencyKey,
    createModule,
    createModelRelease,
  };
}
