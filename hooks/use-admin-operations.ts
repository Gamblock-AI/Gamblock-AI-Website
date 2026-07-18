'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  EducationSource,
  EducationThumbnail,
  RichTextDocument,
} from '@/hooks/use-education';

export interface AdminEducationCheck {
  id: string;
  question: string;
  choices: Array<{ id: string; text: string }>;
  correct_choice_id: string;
  explanation: string;
  required: boolean;
}

export interface AdminEducationDocument {
  category: string;
  estimated_minutes: number;
  reviewer_name: string;
  reviewer_role: string;
  reviewed_at: string;
  translations: Record<
    'id' | 'en',
    {
      title: string;
      summary: string;
      learning_objective: string;
      disclaimer: string;
      reviewer_role: string;
    }
  >;
  sections: Array<{
    id: string;
    sort_order: number;
    required: boolean;
    translations: Record<
      'id' | 'en',
      {
        title: string;
        content: RichTextDocument;
        knowledge_check: AdminEducationCheck;
      }
    >;
  }>;
  thumbnails: EducationThumbnail[];
  sources: EducationSource[];
}

export interface AdminEducationMedia {
  id: string;
  kind: 'upload' | 'external';
  purpose: 'thumbnail' | 'content';
  media_type: 'image' | 'video' | 'pdf';
  mime_type: string;
  external_url?: string;
  width?: number;
  height?: number;
}

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
  draft_document: AdminEducationDocument;
  published_document?: AdminEducationDocument;
  draft_revision: number;
  published_revision: number;
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
  slug: string;
  document: AdminEducationDocument;
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
      const created = await apiClient<AdminEducationModule>(
        '/admin/content/modules',
        {
          method: 'POST',
          body: JSON.stringify(module),
        }
      );
      await load();
      return created;
    },
    [load]
  );

  const getModule = useCallback(
    (id: string) =>
      apiClient<AdminEducationModule>(`/admin/content/modules/${id}`),
    []
  );

  const saveModule = useCallback(
    async (
      module: AdminEducationModule,
      slug: string,
      document: AdminEducationDocument
    ) => {
      const result = await apiClient<AdminEducationModule>(
        `/admin/content/modules/${module.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            slug,
            expected_revision: module.draft_revision,
            document,
          }),
        }
      );
      await load();
      return result;
    },
    [load]
  );

  const transitionModule = useCallback(
    async (id: string, action: 'submit-review' | 'publish' | 'archive') => {
      const result = await apiClient<AdminEducationModule>(
        `/admin/content/modules/${id}/${action}`,
        { method: 'POST' }
      );
      await load();
      return result;
    },
    [load]
  );

  const uploadEducationMedia = useCallback(
    async (file: File, purpose: 'thumbnail' | 'content') => {
      const body = new FormData();
      body.append('file', file);
      body.append('purpose', purpose);
      return apiClient<AdminEducationMedia>('/admin/content/media', {
        method: 'POST',
        body,
      });
    },
    []
  );

  const registerExternalEducationMedia = useCallback(
    (url: string, mediaType: 'image' | 'video' | 'pdf') =>
      apiClient<AdminEducationMedia>('/admin/content/media/external', {
        method: 'POST',
        body: JSON.stringify({
          purpose: 'content',
          media_type: mediaType,
          url,
        }),
      }),
    []
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
    getModule,
    saveModule,
    transitionModule,
    uploadEducationMedia,
    registerExternalEducationMedia,
    createModelRelease,
  };
}
