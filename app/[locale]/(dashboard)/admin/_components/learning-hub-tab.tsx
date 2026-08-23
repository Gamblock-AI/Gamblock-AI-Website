'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  History,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NativeSelect } from '@/components/common/native-select';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import {
  FilterResetButton,
  FilterSearchInput,
  FilterSelect,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { resolveEducationMediaURL } from '@/components/education/media-url';
import { ThumbnailCropper } from '@/components/education/thumbnail-cropper';
import { apiClientBlob } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/feedback';
import type {
  AdminLearningHubItem,
  AdminLearningRevision,
  AdminLearningTaxonomy,
} from '@/hooks/use-admin-operations';
import { cn } from '@/lib/utils';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { InfiniteScrollSentinel } from '@/components/common/infinite-scroll-sentinel';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import {
  AdminStatusBadge,
  adminFieldClassName,
} from './admin-shared';
import {
  FieldError,
  OptionalMark,
  RequiredMark,
} from '@/components/common/form-field';
import { TranslateButton } from '@/components/admin/translate-button';
import { slugify } from './content-tab';
import { ROUTES } from '@/routes';

type Draft = {
  slug: string;
  kind: string;
  title_id: string;
  title_en: string;
  summary_id: string;
  summary_en: string;
  document: Record<string, unknown>;
};

type Cluster = NonNullable<AdminLearningTaxonomy['clusters']>[number];
type Program = NonNullable<AdminLearningTaxonomy['programs']>[number];

const kinds = [
  'course',
  'certification',
  'learning_path',
  'mini_project',
  'career_snapshot',
  'toolkit',
  'opportunity',
];

function collectItemTexts(draft: Draft, locale: 'id' | 'en'): string[] {
  const suffix = `_${locale}`;
  const texts: string[] = [
    (draft[`title${suffix}` as keyof Draft] as string) ?? '',
    (draft[`summary${suffix}` as keyof Draft] as string) ?? '',
    (draft.document[`provider_description${suffix}`] as string) ?? '',
  ];
  const outcomes = draft.document[`outcomes${suffix}`] ?? [];
  if (Array.isArray(outcomes)) {
    for (const o of outcomes) {
      if (typeof o === 'string') texts.push(o);
    }
  }
  return texts;
}

function applyItemTranslations(
  draft: Draft,
  sourceLocale: 'id' | 'en',
  targetLocale: 'id' | 'en',
  translations: string[]
): void {
  let idx = 0;
  const next = (): string => translations[idx++] ?? '';
  const targetSuffix = `_${targetLocale}`;
  const sourceSuffix = `_${sourceLocale}`;

  (draft as Record<string, unknown>)[`title${targetSuffix}`] = next();
  (draft as Record<string, unknown>)[`summary${targetSuffix}`] = next();
  draft.document[`provider_description${targetSuffix}`] = next();

  const sourceOutcomes = draft.document[`outcomes${sourceSuffix}`] ?? [];
  if (Array.isArray(sourceOutcomes)) {
    const mapped: string[] = [];
    for (let i = 0; i < sourceOutcomes.length; i++) {
      mapped.push(next());
    }
    draft.document[`outcomes${targetSuffix}`] = mapped;
  }
}

function text(document: Record<string, unknown>, key: string) {
  const value = document[key];
  return typeof value === 'string' ? value : '';
}

function list(document: Record<string, unknown>, key: string) {
  const value = document[key];
  if (Array.isArray(value))
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .join('\n');
  return typeof value === 'string' ? value : '';
}

function sanitizeOutcomes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function prepareDraftPayload(draft: Draft): Record<string, unknown> {
  const doc = { ...draft.document };
  doc.outcomes_id = sanitizeOutcomes(doc.outcomes_id);
  doc.outcomes_en = sanitizeOutcomes(doc.outcomes_en);
  return {
    ...draft,
    document: doc,
  } as unknown as Record<string, unknown>;
}

function number(document: Record<string, unknown>, key: string) {
  const value = document[key];
  return typeof value === 'number'
    ? String(value)
    : typeof value === 'string'
      ? value
      : '';
}

function itemDraft(item: AdminLearningHubItem): Draft {
  return {
    slug: item.slug,
    kind: item.kind,
    title_id: item.title_id,
    title_en: item.title_en,
    summary_id: item.summary_id,
    summary_en: item.summary_en,
    document: { ...item.draft_document },
  };
}

function emptyDraft(): Draft {
  return {
    slug: '',
    kind: 'course',
    title_id: '',
    title_en: '',
    summary_id: '',
    summary_en: '',
    document: {
      provider: '',
      url: '',
      provider_logo_media_id: '',
      thumbnail_media_id: '',
      duration_minutes: 45,
      reviewer_name: '',
      reviewed_at: new Date().toISOString().slice(0, 10),
      outcomes_id: [],
      outcomes_en: [],
      clusters: [],
      programs: [],
      language: ['id', 'en'],
      cost: 'free_or_audit',
      certificate: 'provider_dependent',
      difficulty: 'beginner',
    },
  };
}

function editDocument(
  draft: Draft,
  key: string,
  value: string | number | string[]
): Draft {
  return { ...draft, document: { ...draft.document, [key]: value } };
}

function AdminLearningMediaPreview({
  mediaID,
  aspect,
}: {
  mediaID: string;
  aspect?: number;
}) {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    apiClientBlob(`/admin/content/media/${mediaID}`)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!active) return;
        setSrc(resolveEducationMediaURL(`/v1/education/media/${mediaID}`));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [mediaID]);

  const isSquare = aspect === 1;
  const sizeClasses = isSquare ? 'size-14' : 'h-14 w-24 sm:w-28';

  if (loading && !src) {
    return (
      <div
        className={cn(
          'border-border/80 bg-muted/40 flex items-center justify-center rounded-xl border',
          sizeClasses
        )}
      >
        <span className="size-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          'border-border/80 bg-muted/25 text-muted-foreground/60 flex items-center justify-center rounded-xl border border-dashed shadow-2xs',
          sizeClasses
        )}
      >
        <ImageIcon className="size-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn(
        'border-border rounded-xl border object-cover shadow-2xs',
        sizeClasses
      )}
    />
  );
}

function LearningMediaField({
  label,
  help,
  mediaID,
  aspect = 16 / 9,
  cropperTitle,
  cropperBody,
  cropperLabel,
  uploading,
  onUpload,
  onChange,
}: {
  label: string;
  help?: string;
  mediaID: string;
  aspect?: number;
  cropperTitle?: string;
  cropperBody?: string;
  cropperLabel?: string;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onChange: (value: string) => void;
}) {
  const isSquare = aspect === 1;
  const sizeClasses = isSquare ? 'size-14' : 'h-14 w-24 sm:w-28';

  return (
    <div className="space-y-2">
      <span className="text-navy flex items-center text-xs font-bold">
        <span>{label}</span>
        <OptionalMark />
      </span>
      {help ? (
        <span className="text-muted-foreground block text-xs">{help}</span>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {mediaID ? (
          <AdminLearningMediaPreview key={mediaID} mediaID={mediaID} aspect={aspect} />
        ) : (
          <div
            className={cn(
              'border-border/80 bg-muted/25 text-muted-foreground/60 flex items-center justify-center rounded-xl border border-dashed shadow-2xs',
              sizeClasses
            )}
          >
            <ImageIcon className="size-5" aria-hidden="true" />
          </div>
        )}
        <ThumbnailCropper
          busy={uploading}
          aspect={aspect}
          title={cropperTitle}
          body={cropperBody}
          label={cropperLabel || (mediaID ? 'Ganti foto' : 'Pilih & Potong foto')}
          buttonVariant="compact"
          onCrop={onUpload}
        />
        {mediaID ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange('')}
            className="text-muted-foreground hover:text-destructive h-8.5 px-2"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LearningHubTab({
  items,
  taxonomy,
  createItem,
  saveItem,
  transitionItem,
  deleteItem,
  getRevisions,
  rollbackItem,
  createCluster,
  updateCluster,
  deleteCluster,
  createProgram,
  updateProgram,
  deleteProgram,
  uploadEducationMedia,
}: {
  items: AdminLearningHubItem[];
  taxonomy: AdminLearningTaxonomy | null;
  createItem: (draft: Record<string, unknown>) => Promise<AdminLearningHubItem>;
  saveItem: (
    item: AdminLearningHubItem,
    draft: Record<string, unknown>
  ) => Promise<AdminLearningHubItem>;
  transitionItem: (
    id: string,
    action: 'submit-review' | 'publish'
  ) => Promise<AdminLearningHubItem>;
  deleteItem: (id: string) => Promise<unknown>;
  getRevisions: (id: string) => Promise<AdminLearningRevision[]>;
  rollbackItem: (
    id: string,
    revisionID: string,
    reason: string
  ) => Promise<AdminLearningHubItem>;
  createCluster: (input: Record<string, unknown>) => Promise<unknown>;
  updateCluster: (
    id: string,
    input: Record<string, unknown>
  ) => Promise<unknown>;
  deleteCluster: (id: string) => Promise<unknown>;
  createProgram: (input: Record<string, unknown>) => Promise<unknown>;
  updateProgram: (
    id: string,
    input: Record<string, unknown>
  ) => Promise<unknown>;
  deleteProgram: (id: string) => Promise<unknown>;
  uploadEducationMedia: (
    file: File,
    purpose: 'thumbnail' | 'content'
  ) => Promise<{ id: string }>;
}) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const appLocale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const sectionParam = searchParams.get('section');
  const section = sectionParam === 'taxonomy' ? 'taxonomy' : 'items';
  const langParam = searchParams.get('lang');
  const isEn = appLocale === 'en' || langParam === 'en';
  const locale: 'id' | 'en' = isEn ? 'en' : 'id';
  const itemParam = searchParams.get('item') || searchParams.get('id');

  const {
    getFilter,
    setFilter: setQueryFilter,
    isExpanded: showItemFilters,
    toggleExpanded: toggleItemFilters,
    activeFilterCount: activeItemFilterCount,
    hasActiveFilters: hasActiveItemFilters,
    clearFilters: clearItemFilters,
  } = useQueryFilters({
    filterKeys: ['status', 'q'],
    ignoredKeys: ['section', 'item', 'id', 'lang'],
  });

  const filter = getFilter('status');
  const searchQuery = getFilter('q');
  const [prevItemParam, setPrevItemParam] = useState(itemParam);
  const [selected, setSelected] = useState<AdminLearningHubItem | null>(() => {
    if (!itemParam) return null;
    return items.find((i) => i.id === itemParam || i.slug === itemParam) ?? null;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (!itemParam) return null;
    const found = items.find((i) => i.id === itemParam || i.slug === itemParam);
    return found ? itemDraft(found) : null;
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mediaUploading, setMediaUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revisions, setRevisions] = useState<AdminLearningRevision[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rollbackRevision, setRollbackRevision] =
    useState<AdminLearningRevision | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [isStuck, setIsStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [newCluster, setNewCluster] = useState({
    slug: '',
    title_id: '',
    title_en: '',
    description_id: '',
    description_en: '',
    sort_order: 0,
  });
  const [newProgram, setNewProgram] = useState({
    slug: '',
    name: '',
    name_id: '',
    name_en: '',
    degree: 'S1',
    primary_cluster_slug: '',
    sort_order: 0,
  });
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [clusterModalOpen, setClusterModalOpen] = useState(false);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'cluster' | 'program' | 'item';
    id: string;
    label: string;
    relatedCount?: number;
  } | null>(null);

  const clusterMap = useMemo(() => {
    const map = new Map<string, Cluster>();
    for (const c of taxonomy?.clusters ?? []) {
      map.set(c.slug, c);
    }
    return map;
  }, [taxonomy?.clusters]);

  const openCreateCluster = () => {
    setEditingCluster(null);
    setNewCluster({
      slug: '',
      title_id: '',
      title_en: '',
      description_id: '',
      description_en: '',
      sort_order: (taxonomy?.clusters?.length ?? 0) + 1,
    });
    setClusterModalOpen(true);
  };

  const openEditCluster = (cluster: Cluster) => {
    setEditingCluster(cluster);
    setClusterModalOpen(true);
  };

  const openCreateProgram = () => {
    const firstActiveCluster = (taxonomy?.clusters ?? []).find((c) => c.active);
    setEditingProgram(null);
    setNewProgram({
      slug: '',
      name: '',
      name_id: '',
      name_en: '',
      degree: 'S1',
      primary_cluster_slug: firstActiveCluster?.slug ?? taxonomy?.clusters?.[0]?.slug ?? '',
      sort_order: (taxonomy?.programs?.length ?? 0) + 1,
    });
    setProgramModalOpen(true);
  };

  const openEditProgram = (program: Program) => {
    setEditingProgram({
      ...program,
      name_id: program.name_id || program.name,
      name_en: program.name_en || program.name,
    });
    setProgramModalOpen(true);
  };

  if (!isCreating && itemParam !== prevItemParam) {
    setPrevItemParam(itemParam);
    const found = itemParam
      ? items.find((i) => i.id === itemParam || i.slug === itemParam) ?? null
      : null;
    setSelected(found);
    setDraft(found ? itemDraft(found) : null);
    setFieldErrors({});
  }

  useEffect(() => {
    if (!draft && !isCreating) return;

    const updateHeight = () => {
      if (stickyHeaderRef.current) {
        setHeaderHeight(stickyHeaderRef.current.offsetHeight);
      }
    };
    updateHeight();

    const handleScroll = () => {
      setIsStuck(window.scrollY > 95);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeight, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeight);
    };
  }, [draft, isCreating]);

  const setLocale = (newLocale: 'id' | 'en') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', newLocale);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const visibleItems = useMemo(() => {
    let result = items;
    if (filter) {
      result = result.filter((item) => item.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title_id?.toLowerCase().includes(q) ||
          item.title_en?.toLowerCase().includes(q) ||
          item.slug?.toLowerCase().includes(q) ||
          item.kind?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, searchQuery, items]);

  const {
    displayedItems: displayedVisibleItems,
    hasMore: hasMoreItems,
    sentinelRef: itemsSentinelRef,
    displayedCount: displayedItemsCount,
    totalCount: totalItemsCount,
  } = useInfiniteScroll({ items: visibleItems, initialBatchSize: 15, batchSize: 15 });

  const clustersList = useMemo(
    () => taxonomy?.clusters ?? [],
    [taxonomy?.clusters]
  );
  const {
    displayedItems: displayedClusters,
    hasMore: hasMoreClusters,
    sentinelRef: clustersSentinelRef,
  } = useInfiniteScroll({ items: clustersList, initialBatchSize: 15, batchSize: 15 });

  const programsList = useMemo(
    () => taxonomy?.programs ?? [],
    [taxonomy?.programs]
  );
  const {
    displayedItems: displayedPrograms,
    hasMore: hasMorePrograms,
    sentinelRef: programsSentinelRef,
  } = useInfiniteScroll({ items: programsList, initialBatchSize: 15, batchSize: 15 });

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateLearningItem = (d: Draft, requireReview: boolean): boolean => {
    const errors: Record<string, string> = {};

    if (!d.title_id.trim()) {
      errors.title_id = 'Judul materi bahasa Indonesia wajib diisi.';
    }
    if (!d.title_en.trim()) {
      errors.title_en = 'Judul materi bahasa Inggris wajib diisi.';
    }
    if (!d.summary_id.trim()) {
      errors.summary_id = 'Ringkasan materi bahasa Indonesia wajib diisi.';
    }
    if (!d.summary_en.trim()) {
      errors.summary_en = 'Ringkasan materi bahasa Inggris wajib diisi.';
    }

    const rawURL = text(d.document, 'url').trim();
    if (rawURL) {
      try {
        const parsed = new URL(rawURL);
        if (parsed.protocol !== 'https:') {
          errors.url = 'Tautan harus menggunakan protokol HTTPS (https://...).';
        }
      } catch {
        errors.url = 'Format tautan URL tidak valid.';
      }
    }

    if (requireReview) {
      if (!text(d.document, 'provider').trim()) {
        errors.provider = 'Nama penyedia materi wajib diisi sebelum penerbitan/tinjauan.';
      }
      if (!rawURL) {
        errors.url = 'Tautan materi wajib diisi sebelum penerbitan/tinjauan.';
      }

      const outcomesId = sanitizeOutcomes(d.document.outcomes_id);
      const outcomesEn = sanitizeOutcomes(d.document.outcomes_en);
      if (outcomesId.length === 0 && outcomesEn.length === 0) {
        errors.outcomes = 'Minimal 1 capaian pembelajaran wajib diisi sebelum penerbitan/tinjauan.';
      }

      const clusters = Array.isArray(d.document.clusters)
        ? d.document.clusters
        : [];
      const programs = Array.isArray(d.document.programs)
        ? d.document.programs
        : [];
      if (clusters.length === 0) {
        errors.clusters = 'Minimal 1 fakultas wajib dipilih sebelum penerbitan/tinjauan.';
      }
      if (programs.length === 0) {
        errors.programs = 'Minimal 1 program studi wajib dipilih sebelum penerbitan/tinjauan.';
      }

      if (!text(d.document, 'reviewer_name').trim()) {
        errors.reviewer_name = 'Nama peninjau kurikulum wajib diisi sebelum penerbitan/tinjauan.';
      }
      const reviewedAt = text(d.document, 'reviewed_at').trim();
      if (!reviewedAt) {
        errors.reviewed_at = 'Tanggal peninjauan wajib diisi sebelum penerbitan/tinjauan.';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
        errors.reviewed_at = 'Format tanggal harus YYYY-MM-DD.';
      }
    }

    setFieldErrors(errors);

    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      if (firstErrorKey === 'title_id' || firstErrorKey === 'summary_id') {
        setLocale('id');
      } else if (firstErrorKey === 'title_en' || firstErrorKey === 'summary_en') {
        setLocale('en');
      }
      setTimeout(() => {
        const el = document.getElementById(`learning-field-${firstErrorKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 50);
      return false;
    }
    return true;
  };

  const selectItem = (item: AdminLearningHubItem) => {
    setIsCreating(false);
    setSelected(item);
    setDraft(itemDraft(item));
    setFieldErrors({});
    const params = new URLSearchParams(searchParams.toString());
    params.set('item', item.id);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelected(null);
    setDraft(emptyDraft());
    setFieldErrors({});
    const params = new URLSearchParams(searchParams.toString());
    params.delete('item');
    params.delete('id');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setDraft(null);
    setSelected(null);
    setFieldErrors({});
    const params = new URLSearchParams(searchParams.toString());
    params.delete('item');
    params.delete('id');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const updateDraft = (next: Partial<Draft>) => {
    setDraft((current) => (current ? { ...current, ...next } : current));
  };

  const updateDoc = (key: string, value: string | number | string[]) => {
    setDraft((current) =>
      current ? editDocument(current, key, value) : current
    );
    clearFieldError(key);
    if (key === 'outcomes_id' || key === 'outcomes_en') {
      clearFieldError('outcomes');
    }
  };

  const save = async () => {
    if (!selected || !draft) return;
    if (!validateLearningItem(draft, false)) return;
    setBusy(true);
    try {
      const payload = prepareDraftPayload(draft);
      const saved = await saveItem(selected, payload);
      setSelected(saved);
      setDraft(itemDraft(saved));
      const params = new URLSearchParams(searchParams.toString());
      params.set('item', saved.id);
      router.replace(`${pathname}?${params.toString()}`);
      toastSuccess(t('learningHubSaved'));
    } catch (error) {
      toastError(error, t('learningHubSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (publishAfter: boolean) => {
    if (!draft) return;
    if (!validateLearningItem(draft, publishAfter)) return;
    setBusy(true);
    try {
      const payload = prepareDraftPayload(draft);
      const created = await createItem(payload);
      if (publishAfter) {
        const published = await transitionItem(created.id, 'publish');
        setSelected(published);
        setDraft(itemDraft(published));
        setIsCreating(false);
        setFieldErrors({});
        const params = new URLSearchParams(searchParams.toString());
        params.set('item', published.id);
        router.replace(`${pathname}?${params.toString()}`);
        toastSuccess(t('learningHubPublished'));
      } else {
        setSelected(created);
        setDraft(itemDraft(created));
        setIsCreating(false);
        setFieldErrors({});
        const params = new URLSearchParams(searchParams.toString());
        params.set('item', created.id);
        router.replace(`${pathname}?${params.toString()}`);
        toastSuccess(t('learningHubCreated'));
      }
    } catch (error) {
      toastError(error, t('learningHubSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const transition = async (
    action: 'submit-review' | 'publish'
  ) => {
    if (!selected || !draft) return;
    if (action === 'publish' || action === 'submit-review') {
      if (!validateLearningItem(draft, true)) return;
    }
    setBusy(true);
    try {
      const payload = prepareDraftPayload(draft);
      const saved = await saveItem(selected, payload);
      const updated = await transitionItem(saved.id, action);
      setSelected(updated);
      setDraft(itemDraft(updated));
      const params = new URLSearchParams(searchParams.toString());
      params.set('item', updated.id);
      router.replace(`${pathname}?${params.toString()}`);
      toastSuccess(
        t(
          action === 'publish'
            ? 'learningHubPublished'
            : 'learningHubSubmitted'
        )
      );
    } catch (error) {
      toastError(error, t('learningHubTransitionError'));
    } finally {
      setBusy(false);
    }
  };

  const openHistory = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      setRevisions(await getRevisions(selected.id));
      setHistoryOpen(true);
    } catch (error) {
      toastError(error, t('fetchError'));
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    if (!selected || !rollbackRevision || !rollbackReason.trim()) return;
    setBusy(true);
    try {
      const updated = await rollbackItem(
        selected.id,
        rollbackRevision.id,
        rollbackReason.trim()
      );
      setSelected(updated);
      setDraft(itemDraft(updated));
      const params = new URLSearchParams(searchParams.toString());
      params.set('item', updated.id);
      router.replace(`${pathname}?${params.toString()}`);
      setRollbackRevision(null);
      setRollbackReason('');
      toastSuccess(t('learningHubRolledBack'));
    } catch (error) {
      toastError(error, t('learningHubTransitionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveClusterModal = async () => {
    const titleId = editingCluster ? editingCluster.title_id : newCluster.title_id;
    const titleEn = editingCluster ? editingCluster.title_en : newCluster.title_en;
    if (!titleId?.trim()) {
      toastError('Judul fakultas (ID) wajib diisi');
      return;
    }
    const slug = slugify(titleId || titleEn || 'fakultas');
    if (!slug) {
      toastError('Judul fakultas tidak valid');
      return;
    }

    setBusy(true);
    try {
      if (editingCluster) {
        await updateCluster(editingCluster.id, {
          slug: editingCluster.slug || slug,
          title_id: editingCluster.title_id.trim(),
          title_en: (editingCluster.title_en || editingCluster.title_id).trim(),
          description_id: editingCluster.description_id,
          description_en: editingCluster.description_en,
          sort_order: Number(editingCluster.sort_order) || 0,
          active: editingCluster.active,
        });
      } else {
        await createCluster({
          ...newCluster,
          slug,
          title_id: newCluster.title_id.trim(),
          title_en: (newCluster.title_en || newCluster.title_id).trim(),
          sort_order: Number(newCluster.sort_order) || 0,
          active: true,
        });
      }
      toastSuccess(t('learningHubTaxonomySaved'));
      setClusterModalOpen(false);
    } catch (error) {
      toastError(error, t('learningHubTaxonomyError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProgramModal = async () => {
    const nameId = editingProgram
      ? (editingProgram.name_id || editingProgram.name)
      : (newProgram.name_id || newProgram.name);
    const nameEn = editingProgram
      ? (editingProgram.name_en || nameId)
      : (newProgram.name_en || nameId);
    if (!nameId?.trim()) {
      toastError('Nama program studi (ID) wajib diisi');
      return;
    }
    const primaryClusterSlug = editingProgram
      ? editingProgram.primary_cluster_slug
      : newProgram.primary_cluster_slug;
    if (!primaryClusterSlug?.trim()) {
      toastError('Silakan pilih fakultas induk');
      return;
    }
    const slug = slugify(nameId || nameEn);
    if (!slug) {
      toastError('Nama program studi tidak valid');
      return;
    }

    setBusy(true);
    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, {
          slug: editingProgram.slug || slug,
          name: nameId.trim(),
          name_id: nameId.trim(),
          name_en: (nameEn || nameId).trim(),
          degree: editingProgram.degree || 'S1',
          primary_cluster_slug: primaryClusterSlug.trim(),
          sort_order: Number(editingProgram.sort_order) || 0,
          active: editingProgram.active,
        });
      } else {
        await createProgram({
          ...newProgram,
          slug,
          name: nameId.trim(),
          name_id: nameId.trim(),
          name_en: (nameEn || nameId).trim(),
          degree: newProgram.degree || 'S1',
          primary_cluster_slug: primaryClusterSlug.trim(),
          sort_order: Number(newProgram.sort_order) || 0,
          active: true,
        });
      }
      toastSuccess(t('learningHubTaxonomySaved'));
      setProgramModalOpen(false);
    } catch (error) {
      toastError(error, t('learningHubTaxonomyError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCluster = (cluster: Cluster) => {
    const activePrograms = (taxonomy?.programs ?? []).filter(
      (p) => p.primary_cluster_slug === cluster.slug && p.active
    );
    setDeleteTarget({
      type: 'cluster',
      id: cluster.id,
      label: cluster.title_id || cluster.title_en || cluster.slug,
      relatedCount: activePrograms.length,
    });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProgram = (program: Program) => {
    setDeleteTarget({
      type: 'program',
      id: program.id,
      label: program.name || program.slug,
    });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteItem = (targetItem?: AdminLearningHubItem) => {
    const item = targetItem || selected;
    if (!item) return;
    setDeleteTarget({
      type: 'item',
      id: item.id,
      label: item.title_id || item.title_en || item.slug,
    });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget.type === 'cluster') {
        await deleteCluster(deleteTarget.id);
        toastSuccess(t('learningHubTaxonomySaved'));
      } else if (deleteTarget.type === 'program') {
        await deleteProgram(deleteTarget.id);
        toastSuccess(t('learningHubTaxonomySaved'));
      } else if (deleteTarget.type === 'item') {
        await deleteItem(deleteTarget.id);
        toastSuccess(t('learningHubItemDeleted'));
        if (selected?.id === deleteTarget.id) {
          setSelected(null);
          setDraft(null);
          setIsCreating(false);
          const params = new URLSearchParams(searchParams.toString());
          params.delete('item');
          params.delete('id');
          router.replace(`${pathname}?${params.toString()}`);
        }
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      if (deleteTarget.type === 'item') {
        toastError(error, t('fetchError'));
      } else {
        toastError(error, t('learningHubTaxonomyError'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h3 className="text-navy text-base font-bold">
            {section === 'items'
              ? t('learningHubItemsTitle')
              : t('learningHubTaxonomyTitle')}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {section === 'items'
              ? t('learningHubItemsDescription')
              : t('learningHubTaxonomyDescription')}
          </p>
        </div>
        {section === 'items' ? (
          <Button size="sm" onClick={startCreate} disabled={busy}>
            <Plus className="size-4" />
            {t('learningHubNewItem')}
          </Button>
        ) : null}
      </div>

      <CompactTabNav<'items' | 'taxonomy'>
        ariaLabel={t('learningHubTabNavigation')}
        value={section}
        items={[
          {
            value: 'items' as const,
            label: t('learningHubTabItems'),
            href: `${ROUTES.ADMIN_LEARNING_HUB}?section=items`,
          },
          {
            value: 'taxonomy' as const,
            label: t('learningHubTabTaxonomy'),
            href: `${ROUTES.ADMIN_LEARNING_HUB}?section=taxonomy`,
          },
        ]}
      />

      {section === 'items' ? (
      <div
        className={cn(
          'grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]',
          draft ? 'xl:items-start' : 'xl:items-stretch'
        )}
      >
        <section className="border-border/80 bg-card max-h-[calc(100vh-14rem)] min-h-[500px] flex flex-col rounded-2xl border p-4 shadow-2xs h-full">
          <div className="mb-3 flex flex-col gap-2.5 shrink-0 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('learningHubStatusFilter')}
                </span>
                <span className="bg-muted/80 text-muted-foreground text-[0.6875rem] font-bold px-1.5 py-0.5 rounded-md border border-border/60">
                  {totalItemsCount}
                </span>
              </div>
              <FilterToggleButton
                isExpanded={showItemFilters}
                onToggle={toggleItemFilters}
                hasActiveFilters={hasActiveItemFilters}
                activeCount={activeItemFilterCount}
                label={t('filterToggle') || 'Filter'}
              />
            </div>

            {showItemFilters ? (
              <div className="flex flex-col gap-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <FilterSearchInput
                  value={searchQuery}
                  onChangeValue={(val) => setQueryFilter('q', val)}
                  placeholder="Cari materi atau slug..."
                  className="w-full sm:w-full"
                />

                <div className="flex items-center justify-between gap-2">
                  <FilterSelect
                    id="learning-hub-status-filter"
                    className="w-full"
                    selectClassName="w-full"
                    ariaLabel={t('learningHubStatusFilter')}
                    value={filter}
                    onChange={(event) => setQueryFilter('status', event.target.value)}
                  >
                    <option value="">{t('learningHubAllStatuses')}</option>
                    <option value="draft">
                      {tDynamic(dynamicLabelKey('status', 'draft'), { value: dynamicLabelFallback('draft') })}
                    </option>
                    <option value="in_review">
                      {tDynamic(dynamicLabelKey('status', 'in_review'), { value: dynamicLabelFallback('in_review') })}
                    </option>
                    <option value="published">
                      {tDynamic(dynamicLabelKey('status', 'published'), { value: dynamicLabelFallback('published') })}
                    </option>
                  </FilterSelect>

                  {hasActiveItemFilters ? (
                    <FilterResetButton
                      onClick={() => clearItemFilters(['status', 'q'])}
                      label={t('clearFilters') || 'Reset'}
                      className="shrink-0"
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
          <div
            className="mt-1 flex-1 overflow-y-auto pr-1.5 space-y-2 min-h-0 focus:outline-none flex flex-col"
            role="list"
            aria-label={t('learningHubItemsTitle')}
          >
            {isCreating ? (
              <div className="border-navy/40 bg-azure/80 text-navy ring-1 ring-navy/20 shadow-xs w-full rounded-xl border p-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-navy line-clamp-2 text-xs font-bold leading-snug">
                    {draft?.title_id || draft?.slug || t('learningHubNewItem')}
                  </span>
                  <span className="border-navy/20 bg-azure/85 text-navy inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-bold shadow-2xs">
                    Draf Baru
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                  <span className="capitalize font-medium">
                    {draft ? (t.has(`learningHubKind_${draft.kind}`) ? t(`learningHubKind_${draft.kind}`) : draft.kind) : ''}
                  </span>
                  <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[0.625rem]">
                    (belum disimpan)
                  </span>
                </div>
              </div>
            ) : null}
            {displayedVisibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectItem(item)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all duration-150',
                  !isCreating && (selected?.id === item.id || itemParam === item.id)
                    ? 'border-navy/40 bg-azure/80 text-navy ring-1 ring-navy/20 shadow-xs'
                    : 'border-border/80 bg-card hover:border-navy/25 hover:bg-muted/35 shadow-2xs'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-navy line-clamp-2 text-xs font-bold leading-snug">
                    {item.title_id || item.slug}
                  </span>
                  <AdminStatusBadge status={item.status} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                  <span className="capitalize font-medium">
                    {t.has(`learningHubKind_${item.kind}`)
                      ? t(`learningHubKind_${item.kind}`)
                      : item.kind.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[0.625rem]">
                    rev {item.draft_revision}
                  </span>
                </div>
              </button>
            ))}
            <InfiniteScrollSentinel
              hasMore={hasMoreItems}
              sentinelRef={itemsSentinelRef}
              loadingText="Memuat materi lainnya..."
            />
            {!visibleItems.length && !isCreating ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 px-4 text-center w-full my-auto">
                <span className="bg-navy/5 text-navy flex size-11 items-center justify-center rounded-2xl ring-1 ring-navy/10">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <div className="mt-3 space-y-1 max-w-[14rem] mx-auto text-center">
                  <p className="text-navy text-xs font-bold text-center">
                    {t('learningHubNoItems')}
                  </p>
                  <p className="text-muted-foreground text-[0.75rem] leading-relaxed text-center">
                    {t('learningHubNoItemsDescription')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span className="text-[0.6875rem] font-medium">
              {displayedItemsCount < totalItemsCount
                ? `Menampilkan ${displayedItemsCount} dari ${totalItemsCount} materi`
                : t('learningHubTotalItems', { count: totalItemsCount })}
            </span>
            {filter ? (
              <span className="text-[0.6875rem] font-semibold text-navy">
                Filter: {tDynamic(dynamicLabelKey('status', filter), { value: dynamicLabelFallback(filter) })}
              </span>
            ) : null}
          </div>
        </section>

        <section
          className={cn(
            'border-border/80 bg-card rounded-2xl border p-5 sm:p-6 shadow-2xs',
            !draft && 'flex flex-col justify-center min-h-[500px] h-full'
          )}
        >
          {!draft ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center my-auto">
              <span className="bg-navy/5 text-navy flex size-12 items-center justify-center rounded-2xl ring-1 ring-navy/10">
                <BookOpen className="size-6" aria-hidden="true" />
              </span>
              <div className="space-y-1.5 max-w-md mx-auto text-center mt-3">
                <p className="text-navy text-sm font-bold text-center">
                  {t('learningHubSelectItem')}
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed text-center">
                  {t('learningHubSelectItemBody')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startCreate}
                className="mt-4 rounded-xl font-medium"
              >
                <Plus className="size-4" />
                {t('learningHubNewItem')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {isStuck ? (
                <div style={{ height: headerHeight || 64 }} aria-hidden="true" />
              ) : null}
              <div
                ref={stickyHeaderRef}
                className={cn(
                  'flex flex-col gap-3 backdrop-blur-md transition-all duration-300 ease-in-out sm:flex-row sm:items-center sm:justify-between',
                  isStuck
                    ? 'fixed top-[4.5rem] left-0 right-0 z-30 border-b border-border/80 bg-card/95 px-4 py-3.5 shadow-md shadow-navy/5 lg:left-[252px] sm:px-6 lg:px-8 xl:px-10'
                    : 'relative z-20 rounded-2xl border border-border bg-card/95 p-4 shadow-sm'
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelCreate}
                    className="hover:bg-muted flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:text-navy"
                    aria-label={t('close')}
                  >
                    <X className="size-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-navy font-extrabold text-base">
                        {draft.title_id ||
                          draft.slug ||
                          (isCreating ? t('learningHubNewItem') : t('learningHubEditorTitle'))}
                      </h2>
                      {isCreating ? (
                        <span className="border-navy/20 bg-azure/85 text-navy inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                          Draf Baru
                        </span>
                      ) : selected ? (
                        <AdminStatusBadge status={selected.status} />
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {!isCreating && selected ? (
                        <span>
                          rev {selected.draft_revision} •{' '}
                          <span className="font-mono text-[0.6875rem]">
                            {selected.slug}
                          </span>
                        </span>
                      ) : (
                        <span className="font-mono text-[0.6875rem] text-muted-foreground">
                          (belum disimpan)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isCreating && selected ? (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void openHistory()}
                    >
                      <History className="size-4" />
                      {t('learningHubHistory')}
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void (isCreating ? handleCreate(false) : save())}
                  >
                    <Save className="size-4" />
                    {isCreating ? t('learningHubCreateDraft') : t('learningHubSave')}
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => void (isCreating ? handleCreate(true) : transition('publish'))}
                  >
                    <Send className="size-4" />
                    {t('learningHubPublish')}
                  </Button>
                  {!isCreating && selected ? (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => handleDeleteItem()}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      {t('learningHubDeleteItem')}
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Language Selector Tab Bar & Contextual Translation Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="border-border bg-muted flex w-fit rounded-xl border p-1">
                  <button
                    type="button"
                    onClick={() => setLocale('id')}
                    className={`min-h-10 rounded-lg px-4 text-sm font-bold flex items-center gap-2 ${
                      locale === 'id'
                        ? 'bg-card text-navy shadow-sm'
                        : 'text-muted-foreground hover:text-navy'
                    }`}
                  >
                    <span>{t('languageIndonesian')}</span>
                    {(fieldErrors.title_id ? 1 : 0) +
                      (fieldErrors.summary_id ? 1 : 0) +
                      (fieldErrors.outcomes &&
                      !sanitizeOutcomes(draft?.document?.outcomes_id).length
                        ? 1
                        : 0) > 0 ? (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">
                        {(fieldErrors.title_id ? 1 : 0) +
                          (fieldErrors.summary_id ? 1 : 0) +
                          (fieldErrors.outcomes &&
                          !sanitizeOutcomes(draft?.document?.outcomes_id).length
                            ? 1
                            : 0)}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale('en')}
                    className={`min-h-10 rounded-lg px-4 text-sm font-bold flex items-center gap-2 ${
                      locale === 'en'
                        ? 'bg-card text-navy shadow-sm'
                        : 'text-muted-foreground hover:text-navy'
                    }`}
                  >
                    <span>{t('languageEnglish')}</span>
                    {(fieldErrors.title_en ? 1 : 0) +
                      (fieldErrors.summary_en ? 1 : 0) +
                      (fieldErrors.outcomes &&
                      !sanitizeOutcomes(draft?.document?.outcomes_en).length
                        ? 1
                        : 0) > 0 ? (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">
                        {(fieldErrors.title_en ? 1 : 0) +
                          (fieldErrors.summary_en ? 1 : 0) +
                          (fieldErrors.outcomes &&
                          !sanitizeOutcomes(draft?.document?.outcomes_en).length
                            ? 1
                            : 0)}
                      </span>
                    ) : null}
                  </button>
                </div>

                <TranslateButton
                  sourceLang={locale === 'en' ? 'id' : 'en'}
                  targetLang={locale === 'en' ? 'en' : 'id'}
                  customLabel={
                    locale === 'en'
                      ? 'Terjemahkan ID ➔ EN'
                      : 'Terjemahkan EN ➔ ID'
                  }
                  sourceTexts={collectItemTexts(
                    draft,
                    locale === 'en' ? 'id' : 'en'
                  )}
                  onTranslated={(translations) => {
                    applyItemTranslations(
                      draft,
                      locale === 'en' ? 'id' : 'en',
                      locale === 'en' ? 'en' : 'id',
                      translations
                    );
                    setDraft({ ...draft });
                  }}
                />
              </div>

              {/* Subsection 1: Bilingual Content (active locale) */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">
                  {locale === 'id'
                    ? 'Konten Bahasa Indonesia'
                    : 'English Content'}
                </h3>
                <div className="border-border/70 bg-muted/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  {locale === 'id' ? (
                    <>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubTitleId')}</span>
                          <RequiredMark />
                        </span>
                        <input
                          id="learning-field-title_id"
                          className={cn(
                            adminFieldClassName,
                            fieldErrors.title_id &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          placeholder="Contoh: Pengenalan Analisis Data & Statistika Terapan"
                          value={draft.title_id}
                          onChange={(event) => {
                            const val = event.target.value;
                            updateDraft({
                              title_id: val,
                              slug: slugify(val || draft.title_en),
                            });
                            clearFieldError('title_id');
                          }}
                        />
                        <FieldError message={fieldErrors.title_id} />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubSummaryId')}</span>
                          <RequiredMark />
                        </span>
                        <textarea
                          id="learning-field-summary_id"
                          className={cn(
                            `${adminFieldClassName} py-2`,
                            fieldErrors.summary_id &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={2}
                          placeholder="Contoh: Ringkasan singkat materi mengenai silabus, target kompetensi, dan capaian pembelajaran..."
                          value={draft.summary_id}
                          onChange={(event) => {
                            updateDraft({ summary_id: event.target.value });
                            clearFieldError('summary_id');
                          }}
                        />
                        <FieldError message={fieldErrors.summary_id} />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('providerDescriptionId')}</span>
                          <OptionalMark />
                        </span>
                        <textarea
                          className={`${adminFieldClassName} py-2`}
                          rows={2}
                          maxLength={200}
                          placeholder="Contoh: Platform edukasi teknologi terkemuka dengan kurikulum terstandarisasi industri..."
                          value={text(draft.document, 'provider_description_id')}
                          onChange={(event) =>
                            updateDoc(
                              'provider_description_id',
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubOutcomesId')}</span>
                          <OptionalMark />
                        </span>
                        <textarea
                          id="learning-field-outcomes"
                          className={cn(
                            `${adminFieldClassName} min-h-32 py-2.5 leading-relaxed`,
                            fieldErrors.outcomes &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={6}
                          placeholder={`Contoh:\nMemahami konsep dasar analisis data\nMampu memvisualisasikan data kuantitatif\nMenerapkan analisis regresi pada studi kasus`}
                          value={list(draft.document, 'outcomes_id')}
                          onChange={(event) =>
                            updateDoc(
                              'outcomes_id',
                              event.target.value.split('\n')
                            )
                          }
                        />
                        <FieldError message={fieldErrors.outcomes} />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubTitleEn')}</span>
                          <RequiredMark />
                        </span>
                        <input
                          id="learning-field-title_en"
                          className={cn(
                            adminFieldClassName,
                            fieldErrors.title_en &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          placeholder="e.g. Introduction to Data Analysis & Applied Statistics"
                          value={draft.title_en}
                          onChange={(event) => {
                            const val = event.target.value;
                            updateDraft({
                              title_en: val,
                              ...(!draft.title_id
                                ? { slug: slugify(val) }
                                : {}),
                            });
                            clearFieldError('title_en');
                          }}
                        />
                        <FieldError message={fieldErrors.title_en} />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubSummaryEn')}</span>
                          <RequiredMark />
                        </span>
                        <textarea
                          id="learning-field-summary_en"
                          className={cn(
                            `${adminFieldClassName} py-2`,
                            fieldErrors.summary_en &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={2}
                          placeholder="e.g. Brief summary covering the syllabus, target competencies, and learning outcomes..."
                          value={draft.summary_en}
                          onChange={(event) => {
                            updateDraft({ summary_en: event.target.value });
                            clearFieldError('summary_en');
                          }}
                        />
                        <FieldError message={fieldErrors.summary_en} />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('providerDescriptionEn')}</span>
                          <OptionalMark />
                        </span>
                        <textarea
                          className={`${adminFieldClassName} py-2`}
                          rows={2}
                          maxLength={200}
                          placeholder="e.g. Leading technology education platform offering industry-standard curriculums..."
                          value={text(draft.document, 'provider_description_en')}
                          onChange={(event) =>
                            updateDoc(
                              'provider_description_en',
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-navy flex items-center text-xs font-bold">
                          <span>{t('learningHubOutcomesEn')}</span>
                          <OptionalMark />
                        </span>
                        <textarea
                          id="learning-field-outcomes-en"
                          className={cn(
                            `${adminFieldClassName} min-h-32 py-2.5 leading-relaxed`,
                            fieldErrors.outcomes &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={6}
                          placeholder={`e.g.:\nUnderstand fundamental data analysis concepts\nAble to visualize quantitative datasets\nApply regression analysis in case studies`}
                          value={list(draft.document, 'outcomes_en')}
                          onChange={(event) =>
                            updateDoc(
                              'outcomes_en',
                              event.target.value.split('\n')
                            )
                          }
                        />
                        <FieldError message={fieldErrors.outcomes} />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Subsection 2: Provider, Media, and Details */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('learningHubProviderMedia')}
                </h3>
                <div className="border-border/70 bg-muted/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubKind')}</span>
                      <RequiredMark />
                    </span>
                    <NativeSelect
                      id="learning-field-kind"
                      className={cn(
                        fieldErrors.kind &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      value={draft.kind}
                      onChange={(event) => {
                        updateDraft({ kind: event.target.value });
                        clearFieldError('kind');
                      }}
                    >
                      {kinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {t(`learningHubKind_${kind}`)}
                        </option>
                      ))}
                    </NativeSelect>
                    <FieldError message={fieldErrors.kind} />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubDurationMinutes')}</span>
                      <OptionalMark />
                    </span>
                    <input
                      id="learning-field-duration_minutes"
                      className={cn(
                        adminFieldClassName,
                        fieldErrors.duration_minutes &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      type="number"
                      min={1}
                      placeholder="45"
                      value={number(draft.document, 'duration_minutes')}
                      onChange={(event) =>
                        updateDoc(
                          'duration_minutes',
                          Number(event.target.value)
                        )
                      }
                    />
                    <FieldError message={fieldErrors.duration_minutes} />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubProvider')}</span>
                      <OptionalMark />
                    </span>
                    <input
                      id="learning-field-provider"
                      className={cn(
                        adminFieldClassName,
                        fieldErrors.provider &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      placeholder="Contoh: Dicoding, Coursera, MIT OpenCourseWare"
                      value={text(draft.document, 'provider')}
                      onChange={(event) =>
                        updateDoc('provider', event.target.value)
                      }
                    />
                    <FieldError message={fieldErrors.provider} />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubSourceUrl')}</span>
                      <OptionalMark />
                    </span>
                    <input
                      id="learning-field-url"
                      className={cn(
                        adminFieldClassName,
                        fieldErrors.url &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      type="url"
                      placeholder="https://www.dicoding.com/academies/..."
                      value={text(draft.document, 'url')}
                      onChange={(event) => updateDoc('url', event.target.value)}
                    />
                    <FieldError message={fieldErrors.url} />
                  </label>
                  <LearningMediaField
                    label={t('learningHubProviderLogo')}
                    help={t('learningHubProviderLogoHelp')}
                    mediaID={text(draft.document, 'provider_logo_media_id')}
                    aspect={1 / 1}
                    cropperTitle="Sesuaikan Logo Penyedia"
                    cropperBody="Geser dan atur zoom logo penyedia. Gambar akan dipotong persegi 1:1."
                    cropperLabel="Pilih & Potong Logo"
                    uploading={mediaUploading}
                    onUpload={async (file) => {
                      setMediaUploading(true);
                      try {
                        const media = await uploadEducationMedia(
                          file,
                          'thumbnail'
                        );
                        updateDoc('provider_logo_media_id', media.id);
                        toastSuccess('Logo penyedia berhasil diperbarui.');
                      } catch {
                        toastError(t('learningHubThumbnailError'));
                      } finally {
                        setMediaUploading(false);
                      }
                    }}
                    onChange={(value) =>
                      updateDoc('provider_logo_media_id', value)
                    }
                  />
                  <LearningMediaField
                    label={t('learningHubThumbnail')}
                    help={t('learningHubThumbnailHelp')}
                    mediaID={text(draft.document, 'thumbnail_media_id')}
                    aspect={16 / 9}
                    cropperTitle="Sesuaikan Thumbnail Kursus"
                    cropperBody="Geser dan atur zoom gambar sampul kartu kursus (16:9)."
                    cropperLabel="Pilih & Potong Thumbnail"
                    uploading={mediaUploading}
                    onUpload={async (file) => {
                      setMediaUploading(true);
                      try {
                        const media = await uploadEducationMedia(
                          file,
                          'thumbnail'
                        );
                        updateDoc('thumbnail_media_id', media.id);
                        toastSuccess('Thumbnail kursus berhasil diperbarui.');
                      } catch {
                        toastError(t('learningHubThumbnailError'));
                      } finally {
                        setMediaUploading(false);
                      }
                    }}
                    onChange={(value) => updateDoc('thumbnail_media_id', value)}
                  />
                </div>
              </div>

              {/* Subsection 3: Taxonomy & Review */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('learningHubOutcomesTaxonomy')}
                </h3>
                <div className="border-border/70 bg-muted/15 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                  {/* Cluster Selection */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-navy flex items-center text-xs font-bold">
                        <span>{t('learningHubClusterSlugs')}</span>
                        <OptionalMark />
                      </span>
                      {Array.isArray(draft.document.clusters) &&
                      draft.document.clusters.length > 0 ? (
                        <span className="text-muted-foreground text-[11px]">
                          {draft.document.clusters.length} dipilih
                        </span>
                      ) : null}
                    </div>
                    {(taxonomy?.clusters?.length ?? 0) === 0 ? (
                      <p className="text-muted-foreground rounded-xl border border-dashed p-3 text-xs">
                        Belum ada data cluster taksonomi.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {taxonomy?.clusters?.map((cluster) => {
                          const clusterList = Array.isArray(
                            draft.document.clusters
                          )
                            ? (draft.document.clusters as string[])
                            : [];
                          const isSelected = clusterList.includes(cluster.slug);
                          const title =
                            locale === 'en'
                              ? cluster.title_en || cluster.title_id
                              : cluster.title_id || cluster.title_en;
                          return (
                            <button
                              key={cluster.slug}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? clusterList.filter(
                                      (s) => s !== cluster.slug
                                    )
                                  : [...clusterList, cluster.slug];
                                updateDoc('clusters', next);
                              }}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all cursor-pointer',
                                isSelected
                                  ? 'border-navy bg-navy text-primary-foreground shadow-xs font-bold'
                                  : 'border-border bg-card text-foreground hover:border-navy/40 hover:bg-muted/30 font-medium'
                              )}
                            >
                              {isSelected ? (
                                <Check className="size-3.5 stroke-[2.5]" />
                              ) : null}
                              <span>{title || cluster.slug}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <FieldError message={fieldErrors.clusters} />
                  </div>

                  {/* Program Selection */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-navy flex items-center text-xs font-bold">
                        <span>{t('learningHubProgramSlugs')}</span>
                        <OptionalMark />
                      </span>
                      {Array.isArray(draft.document.programs) &&
                      draft.document.programs.length > 0 ? (
                        <span className="text-muted-foreground text-[11px]">
                          {draft.document.programs.length} dipilih
                        </span>
                      ) : null}
                    </div>
                    {(taxonomy?.programs?.length ?? 0) === 0 ? (
                      <p className="text-muted-foreground rounded-xl border border-dashed p-3 text-xs">
                        Belum ada data program studi taksonomi.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-background/50 p-2">
                        {taxonomy?.programs?.map((program) => {
                          const programList = Array.isArray(
                            draft.document.programs
                          )
                            ? (draft.document.programs as string[])
                            : [];
                          const isSelected = programList.includes(program.slug);
                          return (
                            <button
                              key={program.slug}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? programList.filter(
                                      (s) => s !== program.slug
                                    )
                                  : [...programList, program.slug];
                                updateDoc('programs', next);
                              }}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all cursor-pointer',
                                isSelected
                                  ? 'border-navy bg-navy text-primary-foreground shadow-xs font-bold'
                                  : 'border-border bg-card text-foreground hover:border-navy/40 hover:bg-muted/30 font-medium'
                              )}
                            >
                              {isSelected ? (
                                <Check className="size-3.5 stroke-[2.5]" />
                              ) : null}
                              <span>
                                {program.degree ? `${program.degree} ` : ''}
                                {program.name || program.slug}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <FieldError message={fieldErrors.programs} />
                  </div>

                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubReviewer')}</span>
                      <OptionalMark />
                    </span>
                    <input
                      id="learning-field-reviewer_name"
                      className={cn(
                        adminFieldClassName,
                        fieldErrors.reviewer_name &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      placeholder="Contoh: Dr. Budi Santoso, M.Kom. / Tim Kurikulum"
                      value={text(draft.document, 'reviewer_name')}
                      onChange={(event) =>
                        updateDoc('reviewer_name', event.target.value)
                      }
                    />
                    <FieldError message={fieldErrors.reviewer_name} />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy flex items-center text-xs font-bold">
                      <span>{t('learningHubReviewedAt')}</span>
                      <OptionalMark />
                    </span>
                    <input
                      id="learning-field-reviewed_at"
                      className={cn(
                        adminFieldClassName,
                        fieldErrors.reviewed_at &&
                          'border-destructive focus-visible:border-destructive'
                      )}
                      type="date"
                      value={text(draft.document, 'reviewed_at')}
                      onChange={(event) =>
                        updateDoc('reviewed_at', event.target.value)
                      }
                    />
                    <FieldError message={fieldErrors.reviewed_at} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      ) : (
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left Column: Faculties (Fakultas) */}
        <section className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-azure/80 text-navy ring-1 ring-navy/10 flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs">
                <Layers className="size-3.5" aria-hidden="true" />
              </span>
              <h3 className="text-navy text-sm font-bold">{t('learningHubClusters')}</h3>
              <span className="text-[0.6875rem] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/60">
                {taxonomy?.clusters?.length ?? 0} fakultas
              </span>
            </div>
            <Button
              size="sm"
              onClick={openCreateCluster}
              className="rounded-xl font-bold text-xs h-8 bg-navy text-white hover:bg-navy-light shadow-2xs"
            >
              <Plus className="size-3.5 mr-1" />
              {t('learningHubAdd')}
            </Button>
          </div>

          <div className="mt-3.5 flex-1 max-h-[560px] overflow-y-auto pr-1 space-y-2.5 min-h-[140px] focus:outline-none">
            {clustersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border/80 bg-muted/15">
                <Layers className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">Belum ada fakultas</p>
                <p className="text-[0.6875rem] text-muted-foreground/80 mt-0.5">Tambahkan fakultas pertama Anda.</p>
              </div>
            ) : (
              <>
                {displayedClusters.map((cluster) => {
                  const connectedProgramsCount = (taxonomy?.programs ?? []).filter(
                    (p) => p.primary_cluster_slug === cluster.slug
                  ).length;
                  const clusterTitle = isEn
                    ? (cluster.title_en || cluster.title_id || 'Faculty')
                    : (cluster.title_id || cluster.title_en || 'Fakultas');
                  const clusterDescription = isEn
                    ? (cluster.description_en || cluster.description_id || '')
                    : (cluster.description_id || cluster.description_en || '');

                  return (
                    <div
                      key={cluster.id}
                      className="border-border/80 bg-card hover:border-navy/30 hover:shadow-xs group flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="text-navy text-sm font-bold truncate">
                            {clusterTitle}
                          </h4>
                          {clusterDescription ? (
                            <p className="text-muted-foreground pt-0.5 text-xs line-clamp-2 leading-relaxed">
                              {clusterDescription}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditCluster(cluster)}
                            className="h-7 px-2 text-xs font-semibold rounded-lg hover:border-navy/30 hover:bg-navy/5 text-navy"
                          >
                            <Pencil className="size-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => void handleDeleteCluster(cluster)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[0.6875rem] text-navy/80 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                          <GraduationCap className="size-3 text-navy/60 shrink-0" />
                          {connectedProgramsCount} Program Studi
                        </span>
                        <span className="text-[0.6875rem] font-medium text-muted-foreground">
                          Urutan #{cluster.sort_order}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <InfiniteScrollSentinel
                  hasMore={hasMoreClusters}
                  sentinelRef={clustersSentinelRef}
                  loadingText="Memuat fakultas lainnya..."
                />
              </>
            )}
          </div>
        </section>

        {/* Right Column: Programs (Program Studi) */}
        <section className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-azure/80 text-navy ring-1 ring-navy/10 flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs">
                <GraduationCap className="size-3.5" aria-hidden="true" />
              </span>
              <h3 className="text-navy text-sm font-bold">{t('learningHubPrograms')}</h3>
              <span className="text-[0.6875rem] font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                {taxonomy?.programs?.length ?? 0} program
              </span>
            </div>
            <Button
              size="sm"
              onClick={openCreateProgram}
              className="rounded-xl font-bold text-xs h-8 bg-navy text-white hover:bg-navy-light shadow-2xs"
            >
              <Plus className="size-3.5 mr-1" />
              {t('learningHubAdd')}
            </Button>
          </div>

          <div className="mt-3.5 flex-1 max-h-[560px] overflow-y-auto pr-1 space-y-2.5 min-h-[140px] focus:outline-none">
            {programsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-border/80 bg-muted/15">
                <GraduationCap className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">Belum ada program studi</p>
                <p className="text-[0.6875rem] text-muted-foreground/80 mt-0.5">Tambahkan program studi pertama Anda.</p>
              </div>
            ) : (
              <>
                {displayedPrograms.map((program) => {
                  const parentCluster = clusterMap.get(program.primary_cluster_slug);
                  const programName = isEn
                    ? (program.name_en || program.name_id || program.name)
                    : (program.name_id || program.name_en || program.name);
                  const facultyName = parentCluster
                    ? (isEn
                        ? (parentCluster.title_en || parentCluster.title_id || parentCluster.slug)
                        : (parentCluster.title_id || parentCluster.title_en || parentCluster.slug))
                    : program.primary_cluster_slug || (isEn ? 'Unassigned' : 'Belum dihubungkan');

                  return (
                    <div
                      key={program.id}
                      className="border-border/80 bg-card hover:border-navy/30 hover:shadow-xs group flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-navy text-sm font-bold truncate">
                              {programName}
                            </h4>
                            {program.degree ? (
                              <span className="text-[0.6875rem] font-bold text-navy bg-azure/60 border border-navy/15 px-2 py-0.5 rounded-md shadow-2xs">
                                Jenjang {program.degree}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers className="size-3 text-navy/70 shrink-0" />
                            <span className="font-semibold text-navy/80">Fakultas:</span>
                            <span className="text-foreground font-medium truncate">
                              {facultyName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditProgram(program)}
                            className="h-7 px-2 text-xs font-semibold rounded-lg hover:border-navy/30 hover:bg-navy/5 text-navy"
                          >
                            <Pencil className="size-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => void handleDeleteProgram(program)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end border-t border-border/50 pt-2 text-xs text-muted-foreground">
                        <span className="text-[0.6875rem] font-medium text-muted-foreground">
                          Urutan #{program.sort_order}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <InfiniteScrollSentinel
                  hasMore={hasMorePrograms}
                  sentinelRef={programsSentinelRef}
                  loadingText="Memuat program studi lainnya..."
                />
              </>
            )}
          </div>
        </section>
      </div>
      )}

      {/* Cluster Modal Dialog */}
      <Dialog open={clusterModalOpen} onOpenChange={setClusterModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCluster ? `Edit Fakultas: ${editingCluster.title_id || 'Fakultas'}` : 'Tambah Fakultas Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingCluster ? 'Perbarui informasi dan deskripsi fakultas.' : 'Buat fakultas baru untuk pengelompokan program studi dan kurikulum.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Nama Fakultas (ID) <span className="text-crimson">*</span>
                </label>
                <input
                  className={adminFieldClassName}
                  placeholder="mis. Fakultas Sains & Teknologi"
                  value={editingCluster ? editingCluster.title_id : newCluster.title_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingCluster) {
                      setEditingCluster({ ...editingCluster, title_id: val, title: val });
                    } else {
                      setNewCluster({ ...newCluster, title_id: val });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Nama Fakultas (EN)
                </label>
                <input
                  className={adminFieldClassName}
                  placeholder="e.g. Faculty of Science & Technology"
                  value={editingCluster ? editingCluster.title_en : newCluster.title_en}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingCluster) {
                      setEditingCluster({ ...editingCluster, title_en: val });
                    } else {
                      setNewCluster({ ...newCluster, title_en: val });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Deskripsi (ID)
                </label>
                <textarea
                  className={`${adminFieldClassName} py-2`}
                  rows={2}
                  placeholder="Deskripsi singkat fakultas..."
                  value={editingCluster ? editingCluster.description_id : newCluster.description_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingCluster) {
                      setEditingCluster({ ...editingCluster, description_id: val, description: val });
                    } else {
                      setNewCluster({ ...newCluster, description_id: val });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Deskripsi (EN)
                </label>
                <textarea
                  className={`${adminFieldClassName} py-2`}
                  rows={2}
                  placeholder="Short description of the faculty..."
                  value={editingCluster ? editingCluster.description_en : newCluster.description_en}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingCluster) {
                      setEditingCluster({ ...editingCluster, description_en: val });
                    } else {
                      setNewCluster({ ...newCluster, description_en: val });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TranslateButton
                sourceLang="id"
                targetLang="en"
                customLabel="Terjemahkan ID ➔ EN"
                sourceTexts={[
                  editingCluster ? editingCluster.title_id : newCluster.title_id,
                  editingCluster ? editingCluster.description_id : newCluster.description_id,
                ]}
                onTranslated={([title, desc]) => {
                  if (editingCluster) {
                    setEditingCluster({ ...editingCluster, title_en: title, description_en: desc });
                  } else {
                    setNewCluster({ ...newCluster, title_en: title, description_en: desc });
                  }
                }}
              />
              <TranslateButton
                sourceLang="en"
                targetLang="id"
                customLabel="Terjemahkan EN ➔ ID"
                sourceTexts={[
                  editingCluster ? editingCluster.title_en : newCluster.title_en,
                  editingCluster ? editingCluster.description_en : newCluster.description_en,
                ]}
                onTranslated={([title, desc]) => {
                  if (editingCluster) {
                    setEditingCluster({ ...editingCluster, title_id: title, title: title, description_id: desc, description: desc });
                  } else {
                    setNewCluster({ ...newCluster, title_id: title, description_id: desc });
                  }
                }}
              />
            </div>

            <div>
              <label className="text-navy text-xs font-bold block mb-1">
                Urutan Tampilan
              </label>
              <input
                type="number"
                className={adminFieldClassName}
                placeholder="0"
                value={editingCluster ? editingCluster.sort_order : newCluster.sort_order}
                onChange={(e) => {
                  const sort_order = Number(e.target.value);
                  if (editingCluster) {
                    setEditingCluster({ ...editingCluster, sort_order });
                  } else {
                    setNewCluster({ ...newCluster, sort_order });
                  }
                }}
              />
            </div>

            {editingCluster ? (
              <label className="text-navy flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="rounded border-border/80"
                  checked={editingCluster.active}
                  onChange={(e) =>
                    setEditingCluster({ ...editingCluster, active: e.target.checked })
                  }
                />
                {t('learningHubActiveInCatalog')}
              </label>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setClusterModalOpen(false)}
              className="rounded-xl font-medium"
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleSaveClusterModal()}
              disabled={busy}
              className="rounded-xl font-bold bg-navy text-white hover:bg-navy-light shadow-2xs"
            >
              <Save className="size-4 mr-1.5" />
              {editingCluster ? t('learningHubSave') : 'Tambah Fakultas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Modal Dialog */}
      <Dialog open={programModalOpen} onOpenChange={setProgramModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? `Edit Program Studi: ${editingProgram.name}` : 'Tambah Program Studi Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Perbarui informasi program studi dan asosiasi fakultas.' : 'Buat program studi baru untuk target kurikulum dan rekomendasi materi.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Nama Program Studi (ID) <span className="text-crimson">*</span>
                </label>
                <input
                  className={adminFieldClassName}
                  placeholder="mis. Informatika"
                  value={editingProgram ? (editingProgram.name_id ?? editingProgram.name) : newProgram.name_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingProgram) {
                      setEditingProgram({ ...editingProgram, name_id: val, name: val });
                    } else {
                      setNewProgram({ ...newProgram, name_id: val, name: val });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Nama Program Studi (EN)
                </label>
                <input
                  className={adminFieldClassName}
                  placeholder="e.g. Informatics"
                  value={editingProgram ? (editingProgram.name_en ?? editingProgram.name) : newProgram.name_en}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingProgram) {
                      setEditingProgram({ ...editingProgram, name_en: val });
                    } else {
                      setNewProgram({ ...newProgram, name_en: val });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TranslateButton
                sourceLang="id"
                targetLang="en"
                customLabel="Terjemahkan ID ➔ EN"
                sourceTexts={[
                  editingProgram ? (editingProgram.name_id || editingProgram.name) : newProgram.name_id,
                ]}
                onTranslated={([name]) => {
                  if (editingProgram) {
                    setEditingProgram({ ...editingProgram, name_en: name });
                  } else {
                    setNewProgram({ ...newProgram, name_en: name });
                  }
                }}
              />
              <TranslateButton
                sourceLang="en"
                targetLang="id"
                customLabel="Terjemahkan EN ➔ ID"
                sourceTexts={[
                  editingProgram ? (editingProgram.name_en || '') : newProgram.name_en,
                ]}
                onTranslated={([name]) => {
                  if (editingProgram) {
                    setEditingProgram({ ...editingProgram, name_id: name, name });
                  } else {
                    setNewProgram({ ...newProgram, name_id: name, name });
                  }
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Jenjang Pendidikan
                </label>
                <NativeSelect
                  value={editingProgram ? editingProgram.degree : newProgram.degree}
                  onChange={(e) => {
                    const degree = e.target.value;
                    if (editingProgram) {
                      setEditingProgram({ ...editingProgram, degree });
                    } else {
                      setNewProgram({ ...newProgram, degree });
                    }
                  }}
                >
                  <option value="S1">S1 (Sarjana)</option>
                  <option value="D3">D3 (Diploma 3)</option>
                  <option value="D4">D4 (Sarjana Terapan)</option>
                  <option value="S2">S2 (Magister)</option>
                  <option value="S3">S3 (Doktor)</option>
                  <option value="Profesi">Profesi / Spesialis</option>
                </NativeSelect>
              </div>
              <div>
                <label className="text-navy text-xs font-bold block mb-1">
                  Fakultas Induk <span className="text-crimson">*</span>
                </label>
                <NativeSelect
                  value={editingProgram ? editingProgram.primary_cluster_slug : newProgram.primary_cluster_slug}
                  onChange={(e) => {
                    const primary_cluster_slug = e.target.value;
                    if (editingProgram) {
                      setEditingProgram({ ...editingProgram, primary_cluster_slug });
                    } else {
                      setNewProgram({ ...newProgram, primary_cluster_slug });
                    }
                  }}
                >
                  <option value="">-- Pilih Fakultas Induk --</option>
                  {(taxonomy?.clusters ?? []).filter((c) => c.active).length === 0 && (
                    <option value="" disabled>
                      Belum ada fakultas aktif — buat fakultas terlebih dahulu
                    </option>
                  )}
                  {(taxonomy?.clusters ?? []).filter((c) => c.active).map((cluster) => {
                    const label = isEn
                      ? (cluster.title_en || cluster.title_id || cluster.slug)
                      : (cluster.title_id || cluster.title_en || cluster.slug);
                    return (
                      <option key={cluster.id} value={cluster.slug}>
                        {label}
                      </option>
                    );
                  })}
                </NativeSelect>
              </div>
            </div>

            <div>
              <label className="text-navy text-xs font-bold block mb-1">
                Urutan Tampilan
              </label>
              <input
                type="number"
                className={adminFieldClassName}
                placeholder="0"
                value={editingProgram ? editingProgram.sort_order : newProgram.sort_order}
                onChange={(e) => {
                  const sort_order = Number(e.target.value);
                  if (editingProgram) {
                    setEditingProgram({ ...editingProgram, sort_order });
                  } else {
                    setNewProgram({ ...newProgram, sort_order });
                  }
                }}
              />
            </div>

            {editingProgram ? (
              <label className="text-navy flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="rounded border-border/80"
                  checked={editingProgram.active}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, active: e.target.checked })
                  }
                />
                {t('learningHubActiveInCatalog')}
              </label>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setProgramModalOpen(false)}
              className="rounded-xl font-medium"
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleSaveProgramModal()}
              disabled={busy}
              className="rounded-xl font-bold bg-navy text-white hover:bg-navy-light shadow-2xs"
            >
              <Save className="size-4 mr-1.5" />
              {editingProgram ? t('learningHubSave') : 'Tambah Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4 shrink-0" />
              {deleteTarget?.type === 'item'
                ? t('learningHubDeleteItemTitle')
                : deleteTarget?.type === 'cluster'
                ? 'Hapus Fakultas?'
                : 'Hapus Program Studi?'}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === 'cluster' && (deleteTarget.relatedCount ?? 0) > 0
                ? 'Fakultas ini masih memiliki program studi aktif dan tidak dapat dihapus.'
                : deleteTarget?.type === 'item'
                ? t('learningHubDeleteItemDescription')
                : `Anda akan menghapus ${deleteTarget?.type === 'cluster' ? 'fakultas' : 'program studi'} ini secara permanen. Tindakan ini tidak dapat dibatalkan.`}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget?.type === 'cluster' && (deleteTarget.relatedCount ?? 0) > 0 ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive font-medium">
              Tidak dapat menghapus fakultas &quot;{deleteTarget.label}&quot; karena masih terhubung dengan{' '}
              <strong>{deleteTarget.relatedCount} program studi aktif</strong>.
              Hapus atau pindahkan program studi tersebut terlebih dahulu.
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm">
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget?.label}&quot;
              </span>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
              className="rounded-xl font-medium"
            >
              {t('cancel')}
            </Button>
            {!(deleteTarget?.type === 'cluster' && (deleteTarget.relatedCount ?? 0) > 0) && (
              <Button
                onClick={() => void handleConfirmDelete()}
                disabled={busy}
                variant="destructive"
                className="rounded-xl font-bold"
              >
                <Trash2 className="size-4 mr-1.5" />
                {deleteTarget?.type === 'item'
                  ? t('learningHubDeleteItem')
                  : 'Hapus Permanen'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={historyOpen}
        onOpenChange={(open) => {
          setHistoryOpen(open);
          if (!open) {
            setRollbackRevision(null);
            setRollbackReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-5 gap-3">
          {rollbackRevision ? (
            <div className="space-y-3">
              <DialogHeader className="gap-1 pb-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setRollbackRevision(null);
                      setRollbackReason('');
                    }}
                    className="size-7 rounded-lg text-muted-foreground hover:text-navy hover:bg-azure/50"
                    title={t('cancel')}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <DialogTitle className="text-navy text-base font-bold">
                    {t('learningHubRollback')}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed pl-9">
                  {t('learningHubRollbackDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-navy/20 bg-azure/25 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-navy text-sm font-extrabold">
                    Versi #{rollbackRevision.revision}
                  </span>
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {rollbackRevision.kind === 'published'
                      ? 'Terbit'
                      : rollbackRevision.kind === 'draft'
                        ? 'Draf'
                        : 'Pemulihan'}
                  </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5 text-muted-foreground/70" />
                  <span>
                    {new Date(rollbackRevision.created_at).toLocaleString(
                      locale === 'id' ? 'id-ID' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </span>
                  {rollbackRevision.created_by && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[160px]">
                        oleh{' '}
                        <strong className="font-semibold text-foreground">
                          {rollbackRevision.created_by}
                        </strong>
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-navy flex items-center text-xs font-bold gap-1">
                  <span>{t('reasonPrompt')}</span>
                  <span className="text-destructive">*</span>
                </label>
                <textarea
                  className={`${adminFieldClassName} min-h-20 py-2 text-xs leading-relaxed`}
                  rows={3}
                  placeholder="Contoh: Pemulihan draf untuk memperbarui referensi kurikulum terbaru…"
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2 sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRollbackRevision(null);
                    setRollbackReason('');
                  }}
                  disabled={busy}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  disabled={busy || !rollbackReason.trim()}
                  onClick={() => void rollback()}
                  className="font-bold gap-1.5 bg-navy text-white hover:bg-navy-light"
                >
                  <RotateCcw className="size-3.5" />
                  {t('learningHubRollback')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <DialogHeader className="gap-1 pb-1">
                <DialogTitle className="text-navy flex items-center gap-2 text-base font-bold">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-azure text-navy">
                    <History className="size-4" />
                  </span>
                  {t('learningHubHistory')}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {t('learningHubHistoryDescription')}
                </DialogDescription>
              </DialogHeader>

              {/* Revision List */}
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-0.5">
                {revisions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    Belum ada riwayat revisi yang tersimpan.
                  </div>
                ) : (
                  revisions.map((revision) => {
                    const isCurrentDraft =
                      revision.revision === selected?.draft_revision;
                    const isPublished =
                      revision.revision === selected?.published_revision;

                    return (
                      <div
                        key={revision.id}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border p-3 transition-all',
                          isCurrentDraft
                            ? 'border-navy/30 bg-azure/20 shadow-2xs'
                            : 'border-border bg-card hover:border-navy/20 hover:bg-muted/30'
                        )}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-navy text-sm font-extrabold">
                              Versi #{revision.revision}
                            </span>
                            {isCurrentDraft && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-navy px-2 py-0.5 text-[11px] font-bold text-white">
                                <Check className="size-3" />
                                Draf Aktif
                              </span>
                            )}
                            {isPublished && (
                              <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                Terbit
                              </span>
                            )}
                            {!isCurrentDraft &&
                              !isPublished &&
                              revision.kind === 'rollback' && (
                                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  Pemulihan
                                </span>
                              )}
                          </div>
                          <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                            <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
                            <span>
                              {new Date(revision.created_at).toLocaleString(
                                locale === 'id' ? 'id-ID' : 'en-US',
                                { dateStyle: 'medium', timeStyle: 'short' }
                              )}
                            </span>
                            {revision.created_by && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[160px]">
                                  oleh{' '}
                                  <strong className="font-semibold text-foreground">
                                    {revision.created_by}
                                  </strong>
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {!isCurrentDraft && (
                          <div className="shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => {
                                setRollbackRevision(revision);
                                setRollbackReason('');
                              }}
                              className="h-8 gap-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white"
                            >
                              <RotateCcw className="size-3.5" />
                              {t('learningHubRollback')}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <DialogFooter className="pt-1 sm:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoryOpen(false)}
                >
                  {t('close')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
