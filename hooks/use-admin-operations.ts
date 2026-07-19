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
  audience: 'student' | 'partner' | 'all';
  experience_type: 'article' | 'partner_response_simulator';
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

export interface AdminSupportMessage {
  id: string;
  author_role: 'requester' | 'admin';
  content: string;
  created_at: string;
}

export interface AdminSupportCase {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  impact?: string;
  owner?: string;
  messages?: AdminSupportMessage[];
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

export interface AdminEducationRevision {
  id: string;
  module_id: string;
  revision: number;
  slug: string;
  kind: 'draft' | 'published' | 'rollback';
  created_by: string;
  created_at: string;
}

export interface AdminRelease {
  id: string;
  version: string;
  platform: string;
  sha256?: string;
  contract_version?: string;
  threshold?: number;
  status: string;
  published_at_text?: string;
}

export type AdminModelRelease = AdminRelease;

export interface AdminReleaseRollout {
  id: string;
  kind: 'model' | 'ruleset' | 'network';
  release_id: string;
  release_version: string;
  status: string;
  platform: string;
  percentage: number;
  app_version_constraint?: string;
  created_at: string;
}

export interface AdminDataRequest {
  id: string;
  title: string;
  type: string;
  status: string;
  failure_code?: string;
  retry_count: number;
  result_expires_at?: string;
  created_at: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  display_name: string;
  role: string;
  disabled_at?: string;
  email_verified_at?: string;
  must_change_password: boolean;
  created_at: string;
}

export interface AdminSiteSocialLink {
  id?: string;
  platform: string;
  label: string;
  url: string | null;
  enabled: boolean;
  sort_order: number;
}

export interface AdminAuditEvent {
  id: string;
  actor: string;
  action: string;
  target_type: string;
  target: string;
  reason: string;
  created_at: string;
}

export interface AdminOverview {
  role: string;
  draft_content?: number;
  review_content?: number;
  open_support?: number;
  unassigned_support?: number;
  failed_data_requests?: number;
  validated_releases?: number;
  active_rollouts?: number;
  pending_emergency?: number;
  active_operators?: number;
  visible_social_links?: number;
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
  platform: boolean;
}

export type AdminArea =
  | 'overview'
  | 'content'
  | 'releases'
  | 'tickets'
  | 'emergency'
  | 'platform'
  | 'all';

export interface AdminModuleDraft {
  slug: string;
  document: AdminEducationDocument;
}

export interface AdminModelReleaseDraft {
  kind: 'model' | 'ruleset' | 'network';
  version: string;
  platform: string;
  artifact_path: string;
  sha256: string;
  contract_version: string;
  threshold: string;
}

interface AdminOperationsState {
  overview: AdminOverview | null;
  modules: AdminEducationModule[];
  releases: Record<'model' | 'ruleset' | 'network', AdminRelease[]>;
  rollouts: AdminReleaseRollout[];
  cases: AdminSupportCase[];
  dataRequests: AdminDataRequest[];
  emergencyRequests: EmergencyKeyRequest[];
  accounts: AdminAccount[];
  socialLinks: AdminSiteSocialLink[];
  auditEvents: AdminAuditEvent[];
}

const EMPTY_STATE: AdminOperationsState = {
  overview: null,
  modules: [],
  releases: { model: [], ruleset: [], network: [] },
  rollouts: [],
  cases: [],
  dataRequests: [],
  emergencyRequests: [],
  accounts: [],
  socialLinks: [],
  auditEvents: [],
};

async function fetchAdminOperations(
  capabilities: AdminCapabilities,
  area: AdminArea
): Promise<AdminOperationsState> {
  const [
    overview,
    modules,
    releasePayload,
    cases,
    dataRequests,
    emergencyRequests,
    operators,
    socialLinks,
    auditEvents,
  ] = await Promise.all([
    area === 'overview' || area === 'all'
      ? apiClient<AdminOverview>('/admin/overview')
      : Promise.resolve(null),
    capabilities.content && (area === 'content' || area === 'all')
      ? apiClient<AdminEducationModule[]>('/admin/content/modules')
      : Promise.resolve([]),
    capabilities.releases && (area === 'releases' || area === 'all')
      ? apiClient<{
          releases: Record<'model' | 'ruleset' | 'network', AdminRelease[]>;
          rollouts: AdminReleaseRollout[];
        }>('/admin/releases')
      : Promise.resolve({ releases: EMPTY_STATE.releases, rollouts: [] }),
    capabilities.support && (area === 'tickets' || area === 'all')
      ? apiClient<AdminSupportCase[]>('/admin/support-cases')
      : Promise.resolve([]),
    capabilities.support && (area === 'tickets' || area === 'all')
      ? apiClient<AdminDataRequest[]>('/admin/data-requests')
      : Promise.resolve([]),
    capabilities.emergency && (area === 'emergency' || area === 'all')
      ? apiClient<EmergencyKeyRequest[]>('/admin/emergency-key-requests')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminAccount[]>('/admin/accounts')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminSiteSocialLink[]>('/admin/site-social-links')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminAuditEvent[]>('/admin/audit-events')
      : Promise.resolve([]),
  ]);

  return {
    overview,
    modules: modules ?? [],
    releases: releasePayload.releases,
    rollouts: releasePayload.rollouts ?? [],
    cases: cases ?? [],
    dataRequests: dataRequests ?? [],
    emergencyRequests: emergencyRequests ?? [],
    accounts: operators ?? [],
    socialLinks: socialLinks ?? [],
    auditEvents: auditEvents ?? [],
  };
}

export function getAdminCapabilities(role?: string): AdminCapabilities {
  const allowed = role === 'admin';
  return {
    content: allowed,
    releases: allowed,
    support: allowed,
    emergency: allowed,
    platform: allowed,
  };
}

export function useAdminOperations(role?: string, area: AdminArea = 'all') {
  const capabilities = useMemo(() => getAdminCapabilities(role), [role]);
  const [data, setData] = useState<AdminOperationsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(Boolean(role));
  const [error, setError] = useState<unknown>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [emergencyKey, setEmergencyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!role || !Object.values(capabilities).some(Boolean)) {
      setData(EMPTY_STATE);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminOperations(capabilities, area));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [area, capabilities, role]);

  useEffect(() => {
    if (!role || !Object.values(capabilities).some(Boolean)) return;
    let active = true;
    void fetchAdminOperations(capabilities, area)
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
  }, [area, capabilities, role]);

  const mutateAndReload = useCallback(
    async <T>(path: string, options: RequestInit) => {
      const result = await apiClient<T>(path, options);
      await load();
      return result;
    },
    [load]
  );

  const approveEmergencyKey = useCallback(
    async (requestID: string) => {
      setKeyLoading(true);
      try {
        const result = await apiClient<{
          request: EmergencyKeyRequest;
          emergency_key: string;
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
        await mutateAndReload(
          `/admin/emergency-key-requests/${requestID}/review`,
          { method: 'POST' }
        );
      } finally {
        setKeyLoading(false);
      }
    },
    [mutateAndReload]
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
      return created;
    },
    []
  );
  const getModule = useCallback(
    (id: string) =>
      apiClient<AdminEducationModule>(`/admin/content/modules/${id}`),
    []
  );
  const saveModule = useCallback(
    (
      module: AdminEducationModule,
      slug: string,
      document: AdminEducationDocument
    ) =>
      mutateAndReload<AdminEducationModule>(
        `/admin/content/modules/${module.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            slug,
            expected_revision: module.draft_revision,
            document,
          }),
        }
      ),
    [mutateAndReload]
  );
  const transitionModule = useCallback(
    (id: string, action: 'submit-review' | 'publish' | 'archive') =>
      mutateAndReload<AdminEducationModule>(
        `/admin/content/modules/${id}/${action}`,
        { method: 'POST' }
      ),
    [mutateAndReload]
  );
  const getModuleRevisions = useCallback(
    (id: string) =>
      apiClient<AdminEducationRevision[]>(
        `/admin/content/modules/${id}/revisions`
      ),
    []
  );
  const rollbackModule = useCallback(
    (moduleID: string, revisionID: string, reason: string) =>
      mutateAndReload<AdminEducationModule>(
        `/admin/content/modules/${moduleID}/revisions/${revisionID}/rollback`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      ),
    [mutateAndReload]
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
    (release: AdminModelReleaseDraft) =>
      mutateAndReload('/releases/model', {
        method: 'POST',
        body: JSON.stringify({
          ...release,
          threshold: Number(release.threshold),
          metrics: {},
        }),
      }).then(() => undefined),
    [mutateAndReload]
  );
  const createRelease = useCallback(
    (release: AdminModelReleaseDraft) => {
      const path =
        release.kind === 'model'
          ? '/releases/model'
          : release.kind === 'ruleset'
            ? '/releases/ruleset'
            : '/releases/network-rulesets';
      return mutateAndReload(path, {
        method: 'POST',
        body: JSON.stringify({
          ...release,
          threshold: Number(release.threshold),
          metrics: {},
          rules: {},
        }),
      }).then(() => undefined);
    },
    [mutateAndReload]
  );
  const uploadReleaseArtifact = useCallback(async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return apiClient<{ artifact_path: string; sha256: string }>(
      '/admin/release-artifacts',
      {
        method: 'POST',
        body,
      }
    );
  }, []);

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
    getModuleRevisions,
    rollbackModule,
    uploadEducationMedia,
    registerExternalEducationMedia,
    createModelRelease,
    createRelease,
    uploadReleaseArtifact,
    getSupportCase: (id: string) =>
      apiClient<AdminSupportCase>(`/admin/support-cases/${id}`),
    claimSupportCase: (id: string, reason: string) =>
      mutateAndReload<AdminSupportCase>(`/admin/support-cases/${id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    releaseSupportCase: (id: string, reason: string) =>
      mutateAndReload(`/admin/support-cases/${id}/release`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    replySupportCase: (id: string, content: string) =>
      mutateAndReload(`/admin/support-cases/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    transitionSupportCase: (id: string, status: string) =>
      mutateAndReload(`/admin/support-cases/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    retryDataRequest: (id: string) =>
      mutateAndReload(`/admin/data-requests/${id}/retry`, { method: 'POST' }),
    rejectDataRequest: (id: string, reason: string) =>
      mutateAndReload(`/admin/data-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    createRollout: (input: {
      kind: string;
      release_id: string;
      platform: string;
      percentage: number;
      app_version_constraint?: string;
      reason: string;
    }) =>
      mutateAndReload('/admin/releases/rollouts', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    transitionRollout: (id: string, action: string, reason: string) =>
      mutateAndReload(`/admin/releases/rollouts/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),
    replaceSocialLinks: (items: AdminSiteSocialLink[], reason: string) =>
      mutateAndReload<AdminSiteSocialLink[]>('/admin/site-social-links', {
        method: 'PUT',
        body: JSON.stringify({ items, reason }),
      }),
    createAccount: (
      email: string,
      displayName: string,
      accountRole: string,
      reason: string
    ) =>
      mutateAndReload<{ account: AdminAccount; temporary_password: string }>(
        '/admin/accounts',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            display_name: displayName,
            role: accountRole,
            reason,
          }),
        }
      ),
    updateAccount: (id: string, disabled: boolean, reason: string) =>
      mutateAndReload(`/admin/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled, reason }),
      }),
  };
}
