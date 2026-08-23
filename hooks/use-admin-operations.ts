'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  EducationSource,
  EducationThumbnail,
  EducationVideo,
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
  videos: EducationVideo[];
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

export interface AdminLearningHubItem {
  id: string;
  slug: string;
  kind: string;
  title: string;
  title_id: string;
  title_en: string;
  summary: string;
  summary_id: string;
  summary_en: string;
  provider?: string;
  url?: string;
  status: string;
  draft_revision: number;
  published_revision: number;
  draft_document: Record<string, unknown>;
  published_document?: Record<string, unknown>;
  published_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLearningRevision {
  id: string;
  item_id: string;
  revision: number;
  document: Record<string, unknown>;
  kind: string;
  created_by: string;
  created_at: string;
}

export interface AdminLearningTaxonomy {
  institution: { id: string; slug: string; name: string; status: string };
  clusters: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    title_id: string;
    title_en: string;
    description_id: string;
    description_en: string;
    sort_order: number;
    active: boolean;
  }>;
  programs: Array<{
    id: string;
    institution_id: string;
    slug: string;
    name: string;
    name_id?: string;
    name_en?: string;
    degree: string;
    primary_cluster_slug: string;
    sort_order: number;
    active: boolean;
  }>;
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
  phone_e164?: string;
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
  learningHub: boolean;
  support: boolean;
  emergency: boolean;
  platform: boolean;
}

export type AdminArea =
  | 'overview'
  | 'content'
  | 'learningHub'
  | 'tickets'
  | 'dataRequests'
  | 'emergency'
  | 'platform'
  | 'all';

export interface AdminModuleDraft {
  slug: string;
  document: AdminEducationDocument;
}

interface AdminOperationsState {
  overview: AdminOverview | null;
  modules: AdminEducationModule[];
  learningHubItems: AdminLearningHubItem[];
  learningHubTaxonomy: AdminLearningTaxonomy | null;
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
  learningHubItems: [],
  learningHubTaxonomy: null,
  cases: [],
  dataRequests: [],
  emergencyRequests: [],
  accounts: [],
  socialLinks: [],
  auditEvents: [],
};

export type PaginatedData<T> = {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
};

export function unwrapItems<T>(payload: T[] | PaginatedData<T> | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'items' in payload && Array.isArray((payload as PaginatedData<T>).items)) {
    return (payload as PaginatedData<T>).items;
  }
  return [];
}

export function normalizePaginated<T>(
  payload: T[] | PaginatedData<T> | null | undefined,
  defaultPage = 1,
  defaultLimit = 10
): PaginatedData<T> {
  if (!payload) {
    return { items: [], total_count: 0, page: defaultPage, page_size: defaultLimit, total_pages: 1, has_more: false };
  }
  if (Array.isArray(payload)) {
    const total = payload.length;
    const totalPages = Math.max(1, Math.ceil(total / defaultLimit));
    return {
      items: payload,
      total_count: total,
      page: defaultPage,
      page_size: defaultLimit,
      total_pages: totalPages,
      has_more: defaultPage < totalPages,
    };
  }
  return {
    items: payload.items ?? [],
    total_count: payload.total_count ?? (payload.items ? payload.items.length : 0),
    page: payload.page ?? defaultPage,
    page_size: payload.page_size ?? defaultLimit,
    total_pages:
      payload.total_pages ??
      Math.max(1, Math.ceil((payload.total_count ?? 0) / (payload.page_size ?? defaultLimit))),
    has_more: payload.has_more ?? false,
  };
}

async function fetchAdminOperations(
  capabilities: AdminCapabilities,
  area: AdminArea
): Promise<AdminOperationsState> {
  const [
    overview,
    modules,
    learningHubItems,
    learningHubTaxonomy,
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
      ? apiClient<AdminEducationModule[] | PaginatedData<AdminEducationModule>>('/admin/content/modules')
      : Promise.resolve([]),
    capabilities.learningHub && (area === 'learningHub' || area === 'all')
      ? apiClient<AdminLearningHubItem[] | PaginatedData<AdminLearningHubItem>>('/admin/content/learning-hub/items')
      : Promise.resolve([]),
    capabilities.learningHub && (area === 'learningHub' || area === 'all')
      ? apiClient<AdminLearningTaxonomy>('/admin/content/learning-hub/taxonomy')
      : Promise.resolve(null),
    capabilities.support && (area === 'tickets' || area === 'all')
      ? apiClient<AdminSupportCase[] | PaginatedData<AdminSupportCase>>('/admin/support-cases')
      : Promise.resolve([]),
    capabilities.support && (area === 'dataRequests' || area === 'all')
      ? apiClient<AdminDataRequest[] | PaginatedData<AdminDataRequest>>('/admin/data-requests')
      : Promise.resolve([]),
    capabilities.emergency && (area === 'emergency' || area === 'all')
      ? apiClient<EmergencyKeyRequest[] | PaginatedData<EmergencyKeyRequest>>('/admin/emergency-key-requests')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminAccount[] | PaginatedData<AdminAccount>>('/admin/accounts')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminSiteSocialLink[]>('/admin/site-social-links')
      : Promise.resolve([]),
    capabilities.platform && (area === 'platform' || area === 'all')
      ? apiClient<AdminAuditEvent[] | PaginatedData<AdminAuditEvent>>('/admin/audit-events')
      : Promise.resolve([]),
  ]);

  return {
    overview,
    modules: unwrapItems(modules),
    learningHubItems: unwrapItems(learningHubItems),
    learningHubTaxonomy,
    cases: unwrapItems(cases),
    dataRequests: unwrapItems(dataRequests),
    emergencyRequests: unwrapItems(emergencyRequests),
    accounts: unwrapItems(operators),
    socialLinks: socialLinks ?? [],
    auditEvents: unwrapItems(auditEvents),
  };
}

export function getAdminCapabilities(role?: string): AdminCapabilities {
  const allowed = role === 'admin';
  return {
    content: allowed,
    learningHub: allowed,
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

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!role || !Object.values(capabilities).some(Boolean)) {
        setData(EMPTY_STATE);
        setLoading(false);
        return;
      }
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        setData(await fetchAdminOperations(capabilities, area));
      } catch (requestError) {
        setError(requestError);
      } finally {
        setLoading(false);
      }
    },
    [area, capabilities, role]
  );

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
      await load({ silent: true });
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

  const createModule = useCallback(async (module: AdminModuleDraft) => {
    const created = await apiClient<AdminEducationModule>(
      '/admin/content/modules',
      {
        method: 'POST',
        body: JSON.stringify(module),
      }
    );
    return created;
  }, []);
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
    (id: string, action: 'submit-review' | 'publish') =>
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
  const deleteModule = useCallback(
    (id: string) =>
      mutateAndReload(`/admin/content/modules/${id}`, { method: 'DELETE' }),
    [mutateAndReload]
  );

  const createLearningHubItem = useCallback(
    (draft: Record<string, unknown>) =>
      mutateAndReload<AdminLearningHubItem>(
        '/admin/content/learning-hub/items',
        {
          method: 'POST',
          body: JSON.stringify(draft),
        }
      ),
    [mutateAndReload]
  );
  const saveLearningHubItem = useCallback(
    (item: AdminLearningHubItem, draft: Record<string, unknown>) =>
      mutateAndReload<AdminLearningHubItem>(
        `/admin/content/learning-hub/items/${item.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            expected_revision: item.draft_revision,
            draft,
          }),
        }
      ),
    [mutateAndReload]
  );
  const deleteLearningHubItem = useCallback(
    (id: string) =>
      mutateAndReload(`/admin/content/learning-hub/items/${id}`, {
        method: 'DELETE',
      }),
    [mutateAndReload]
  );

  const transitionLearningHubItem = useCallback(
    (id: string, action: 'submit-review' | 'publish') =>
      mutateAndReload<AdminLearningHubItem>(
        `/admin/content/learning-hub/items/${id}/${action}`,
        { method: 'POST' }
      ),
    [mutateAndReload]
  );
  const getLearningHubRevisions = useCallback(
    (id: string) =>
      apiClient<AdminLearningRevision[]>(
        `/admin/content/learning-hub/items/${id}/revisions`
      ),
    []
  );
  const rollbackLearningHubItem = useCallback(
    (id: string, revisionID: string, reason: string) =>
      mutateAndReload<AdminLearningHubItem>(
        `/admin/content/learning-hub/items/${id}/revisions/${revisionID}/rollback`,
        { method: 'POST', body: JSON.stringify({ reason }) }
      ),
    [mutateAndReload]
  );
  const createLearningHubCluster = useCallback(
    (input: Record<string, unknown>) =>
      mutateAndReload('/admin/content/learning-hub/taxonomy/clusters', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    [mutateAndReload]
  );
  const updateLearningHubCluster = useCallback(
    (id: string, input: Record<string, unknown>) =>
      mutateAndReload(`/admin/content/learning-hub/taxonomy/clusters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    [mutateAndReload]
  );
  const deleteLearningHubCluster = useCallback(
    (id: string) =>
      mutateAndReload(`/admin/content/learning-hub/taxonomy/clusters/${id}`, {
        method: 'DELETE',
      }),
    [mutateAndReload]
  );
  const createLearningHubProgram = useCallback(
    (input: Record<string, unknown>) =>
      mutateAndReload('/admin/content/learning-hub/taxonomy/programs', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    [mutateAndReload]
  );
  const updateLearningHubProgram = useCallback(
    (id: string, input: Record<string, unknown>) =>
      mutateAndReload(`/admin/content/learning-hub/taxonomy/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    [mutateAndReload]
  );
  const deleteLearningHubProgram = useCallback(
    (id: string) =>
      mutateAndReload(`/admin/content/learning-hub/taxonomy/programs/${id}`, {
        method: 'DELETE',
      }),
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
    fetchModules: (params?: { page?: number; limit?: number; status?: string; q?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      if (params?.q) qp.set('q', params.q);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminEducationModule> | AdminEducationModule[]>(
        `/admin/content/modules${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 10));
    },
    fetchLearningHubItems: (params?: { page?: number; limit?: number; status?: string; q?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      if (params?.q) qp.set('q', params.q);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminLearningHubItem> | AdminLearningHubItem[]>(
        `/admin/content/learning-hub/items${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 15));
    },
    fetchSupportCases: (params?: { page?: number; limit?: number; status?: string; priority?: string; q?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      if (params?.priority) qp.set('priority', params.priority);
      if (params?.q) qp.set('q', params.q);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminSupportCase> | AdminSupportCase[]>(
        `/admin/support-cases${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 10));
    },
    fetchDataRequests: (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      if (params?.type) qp.set('type', params.type);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminDataRequest> | AdminDataRequest[]>(
        `/admin/data-requests${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 10));
    },
    fetchAccounts: (params?: { page?: number; limit?: number; role?: string; q?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.role) qp.set('role', params.role);
      if (params?.q) qp.set('q', params.q);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminAccount> | AdminAccount[]>(
        `/admin/accounts${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 10));
    },
    fetchAuditEvents: (params?: { page?: number; limit?: number; action?: string; actor?: string; q?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.action) qp.set('action', params.action);
      if (params?.actor) qp.set('actor', params.actor);
      if (params?.q) qp.set('q', params.q);
      const query = qp.toString();
      return apiClient<PaginatedData<AdminAuditEvent> | AdminAuditEvent[]>(
        `/admin/audit-events${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 10));
    },
    fetchEmergencyRequests: (params?: { page?: number; limit?: number; status?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      const query = qp.toString();
      return apiClient<PaginatedData<EmergencyKeyRequest> | EmergencyKeyRequest[]>(
        `/admin/emergency-key-requests${query ? `?${query}` : ''}`
      ).then((res) => normalizePaginated(res, params?.page || 1, params?.limit || 5));
    },
    createModule,
    getModule,
    saveModule,
    transitionModule,
    deleteModule,
    getModuleRevisions,
    rollbackModule,
    createLearningHubItem,
    saveLearningHubItem,
    transitionLearningHubItem,
    deleteLearningHubItem,
    getLearningHubRevisions,
    rollbackLearningHubItem,
    createLearningHubCluster,
    updateLearningHubCluster,
    deleteLearningHubCluster,
    createLearningHubProgram,
    updateLearningHubProgram,
    deleteLearningHubProgram,
    uploadEducationMedia,
    registerExternalEducationMedia,
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
    replaceSocialLinks: (items: AdminSiteSocialLink[], reason: string) =>
      mutateAndReload<AdminSiteSocialLink[]>('/admin/site-social-links', {
        method: 'PUT',
        body: JSON.stringify({ items, reason }),
      }),
    createAccount: (
      email: string,
      phone: string,
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
            phone,
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
