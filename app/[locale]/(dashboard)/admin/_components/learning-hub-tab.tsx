'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Archive,
  BookOpen,
  Check,
  History,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import {
  AdminSectionHeader,
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

function AdminLearningMediaPreview({ mediaID }: { mediaID: string }) {
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

  if (loading && !src) {
    return (
      <div className="border-border bg-muted/40 flex h-14 w-20 items-center justify-center rounded-lg border">
        <span className="size-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!src) {
    return (
      <span className="border-border text-muted-foreground flex h-14 w-20 items-center justify-center rounded-lg border text-xs">
        -
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="border-border h-14 w-20 rounded-lg border object-cover"
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
          <AdminLearningMediaPreview key={mediaID} mediaID={mediaID} />
        ) : (
          <span className="border-border text-muted-foreground flex h-14 w-20 items-center justify-center rounded-lg border text-xs">
            -
          </span>
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
    action: 'submit-review' | 'publish' | 'archive'
  ) => Promise<AdminLearningHubItem>;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const section = sectionParam === 'taxonomy' ? 'taxonomy' : 'items';
  const langParam = searchParams.get('lang');
  const locale: 'id' | 'en' = langParam === 'en' ? 'en' : 'id';
  const itemParam = searchParams.get('item') || searchParams.get('id');
  const [filter, setFilter] = useState('');
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
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackRevision, setRollbackRevision] =
    useState<AdminLearningRevision | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
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
    degree: 'S1',
    primary_cluster_slug: '',
    sort_order: 0,
  });
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const clusterEdits = useRef(new Map<string, Cluster>());
  const programEdits = useRef(new Map<string, Program>());

  if (!isCreating && itemParam !== prevItemParam) {
    setPrevItemParam(itemParam);
    const found = itemParam
      ? items.find((i) => i.id === itemParam || i.slug === itemParam) ?? null
      : null;
    setSelected(found);
    setDraft(found ? itemDraft(found) : null);
    setFieldErrors({});
  }

  const setLocale = (newLocale: 'id' | 'en') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', newLocale);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const visibleItems = useMemo(
    () => (filter ? items.filter((item) => item.status === filter) : items),
    [filter, items]
  );

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
        errors.clusters = 'Minimal 1 cluster keilmuan wajib dipilih sebelum penerbitan/tinjauan.';
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
    action: 'submit-review' | 'publish' | 'archive'
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
            : action === 'archive'
              ? 'learningHubArchived'
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
      setRollbackOpen(false);
      setRollbackRevision(null);
      setRollbackReason('');
      toastSuccess(t('learningHubRolledBack'));
    } catch (error) {
      toastError(error, t('learningHubTransitionError'));
    } finally {
      setBusy(false);
    }
  };

  const createTaxonomy = async (kind: 'cluster' | 'program') => {
    setBusy(true);
    try {
      if (kind === 'cluster') {
        await createCluster(newCluster);
        setNewCluster({
          slug: '',
          title_id: '',
          title_en: '',
          description_id: '',
          description_en: '',
          sort_order: 0,
        });
      } else {
        await createProgram(newProgram);
        setNewProgram({
          slug: '',
          name: '',
          degree: 'S1',
          primary_cluster_slug: '',
          sort_order: 0,
        });
      }
      toastSuccess(t('learningHubTaxonomySaved'));
    } catch (error) {
      toastError(error, t('learningHubTaxonomyError'));
    } finally {
      setBusy(false);
    }
  };

  const saveCluster = async () => {
    if (!editingCluster) return;
    setBusy(true);
    try {
      await updateCluster(editingCluster.id, {
        slug: editingCluster.slug,
        title_id: editingCluster.title_id,
        title_en: editingCluster.title_en,
        description_id: editingCluster.description_id,
        description_en: editingCluster.description_en,
        sort_order: editingCluster.sort_order,
        active: editingCluster.active,
      });
      toastSuccess(t('learningHubTaxonomySaved'));
    } catch (error) {
      toastError(error, t('learningHubTaxonomyError'));
    } finally {
      setBusy(false);
    }
  };

  const saveProgram = async () => {
    if (!editingProgram) return;
    setBusy(true);
    try {
      await updateProgram(editingProgram.id, {
        slug: editingProgram.slug,
        name: editingProgram.name,
        degree: editingProgram.degree,
        primary_cluster_slug: editingProgram.primary_cluster_slug,
        sort_order: editingProgram.sort_order,
        active: editingProgram.active,
      });
      toastSuccess(t('learningHubTaxonomySaved'));
    } catch (error) {
      toastError(error, t('learningHubTaxonomyError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <AdminSectionHeader
        title={
          section === 'items'
            ? t('learningHubItemsTitle')
            : t('learningHubTaxonomyTitle')
        }
        description={
          section === 'items'
            ? t('learningHubItemsDescription')
            : t('learningHubTaxonomyDescription')
        }
        action={
          section === 'items' ? (
            <Button onClick={startCreate} disabled={busy}>
              <Plus className="size-4" />
              {t('learningHubNewItem')}
            </Button>
          ) : undefined
        }
      />

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
      <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <section className="border-border/80 bg-card max-h-[calc(100vh-14rem)] min-h-[500px] flex flex-col rounded-2xl border p-4 shadow-2xs">
          <div className="mb-3 flex items-center justify-between gap-3 shrink-0 pb-3 border-b border-border/60">
            <label
              className="text-navy text-xs font-bold uppercase tracking-wider"
              htmlFor="learning-hub-status-filter"
            >
              {t('learningHubStatusFilter')}
            </label>
            <NativeSelect
              id="learning-hub-status-filter"
              className="h-8.5 w-auto min-w-32 text-xs font-medium"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">{t('learningHubAllStatuses')}</option>
              <option value="draft">draft</option>
              <option value="in_review">in_review</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </NativeSelect>
          </div>
          <div
            className="mt-1 flex-1 overflow-y-auto pr-1.5 space-y-2 min-h-0 focus:outline-none"
            role="list"
            aria-label={t('learningHubItemsTitle')}
          >
            {isCreating ? (
              <div className="border-navy/40 bg-azure/80 text-navy ring-1 ring-navy/20 shadow-xs w-full rounded-xl border p-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-navy line-clamp-2 text-xs font-bold leading-snug">
                    {draft?.title_id || draft?.slug || t('learningHubNewItem')}
                  </span>
                  <span className="bg-navy/10 text-navy rounded-full px-2 py-0.5 text-[0.6875rem] font-bold">
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
            {visibleItems.map((item) => (
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
                  <AdminStatusBadge status={item.status} />
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
            {!visibleItems.length && !isCreating ? (
              <p className="text-muted-foreground py-8 text-center text-xs">
                {t('learningHubNoItems')}
              </p>
            ) : null}
          </div>
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span className="text-[0.6875rem] font-medium">
              {t('learningHubTotalItems', { count: visibleItems.length })}
            </span>
            {filter ? (
              <span className="text-[0.6875rem] font-semibold text-navy">
                Filter: {filter}
              </span>
            ) : null}
          </div>
        </section>

        <section className="border-border/80 bg-card rounded-2xl border p-5 sm:p-6 shadow-2xs">
          {!draft ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="border-border/80 bg-muted/60 text-muted-foreground flex size-12 items-center justify-center rounded-2xl border shadow-2xs">
                <BookOpen className="size-6" aria-hidden="true" />
              </span>
              <p className="text-navy mt-3 text-sm font-bold">
                {t('learningHubSelectItem')}
              </p>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                {t('learningHubSelectItemBody')}
              </p>
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
              <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  {!isCreating && selected ? (
                    <div className="flex items-center gap-2">
                      <span className="border-border/60 bg-muted/70 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[0.6875rem] font-semibold">
                        {selected.slug}
                      </span>
                      <span className="text-muted-foreground font-mono text-[0.6875rem]">
                        rev {selected.draft_revision}
                      </span>
                    </div>
                  ) : null}
                  <h2 className="text-navy mt-1 text-lg font-bold">
                    {draft.title_id ||
                      draft.slug ||
                      (isCreating ? t('learningHubNewItem') : t('learningHubEditorTitle'))}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {isCreating ? (
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      Draf Baru
                    </span>
                  ) : selected ? (
                    <AdminStatusBadge status={selected.status} />
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
                            `${adminFieldClassName} py-2`,
                            fieldErrors.outcomes &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={3}
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
                            `${adminFieldClassName} py-2`,
                            fieldErrors.outcomes &&
                              'border-destructive focus-visible:border-destructive'
                          )}
                          rows={3}
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

              {/* Action Bar */}
              <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                {isCreating ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={cancelCreate}
                      disabled={busy}
                      className="rounded-xl font-medium"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleCreate(false)}
                      disabled={busy}
                      className="rounded-xl font-medium"
                    >
                      <Plus className="size-4" />
                      {t('learningHubCreateDraft')}
                    </Button>
                    <Button
                      onClick={() => void handleCreate(true)}
                      disabled={busy}
                      className="shadow-soft rounded-xl font-bold"
                    >
                      <Send className="size-4" />
                      {t('learningHubPublish')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void save()}
                      disabled={busy}
                      className="rounded-xl font-medium"
                    >
                      <Save className="size-4" />
                      {t('learningHubSave')}
                    </Button>
                    <Button
                      onClick={() => void transition('publish')}
                      disabled={busy}
                      className="shadow-soft rounded-xl font-bold"
                    >
                      <Send className="size-4" />
                      {t('learningHubPublish')}
                    </Button>
                    {selected?.status === 'published' ? (
                      <Button
                        variant="outline"
                        onClick={() => void transition('archive')}
                        disabled={busy}
                        className="rounded-xl font-medium"
                      >
                        <Archive className="size-4" />
                        {t('learningHubArchive')}
                      </Button>
                    ) : null}
                  </div>
                )}
                {!isCreating && selected ? (
                  <Button
                    variant="ghost"
                    onClick={() => void openHistory()}
                    disabled={busy}
                    className="text-muted-foreground hover:text-navy rounded-xl font-medium"
                  >
                    <History className="size-4" />
                    {t('learningHubHistory')}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
      ) : (
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-navy text-sm font-bold">{t('learningHubClusters')}</h3>
              <span className="text-[0.6875rem] font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                {taxonomy?.clusters?.length ?? 0} cluster
              </span>
            </div>

            <div className="mt-3 max-h-[360px] overflow-y-auto pr-1.5 space-y-2.5 min-h-0 focus:outline-none">
              {(taxonomy?.clusters ?? []).map((cluster) => (
                <div
                  key={cluster.id}
                  className="border-border/80 bg-muted/20 hover:bg-muted/35 hover:border-navy/20 grid gap-2.5 rounded-xl border p-3.5 shadow-2xs transition-all sm:grid-cols-[1fr_auto]"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      aria-label={`${cluster.slug} slug`}
                      className={adminFieldClassName}
                      placeholder="slug-klaster"
                      defaultValue={cluster.slug}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          slug: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label={`${cluster.slug} sort order`}
                      className={adminFieldClassName}
                      type="number"
                      placeholder="0"
                      defaultValue={cluster.sort_order}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          sort_order: Number(event.target.value),
                        })
                      }
                    />
                    <input
                      aria-label={`${cluster.slug} Indonesian title`}
                      className={adminFieldClassName}
                      placeholder="Judul klaster (ID)"
                      defaultValue={cluster.title_id}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          title_id: event.target.value,
                          title: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label={`${cluster.slug} English title`}
                      className={adminFieldClassName}
                      placeholder="Cluster title (EN)"
                      defaultValue={cluster.title_en}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          title_en: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label={`${cluster.slug} Indonesian description`}
                      className={adminFieldClassName}
                      placeholder="Deskripsi klaster (ID)"
                      defaultValue={cluster.description_id}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          description_id: event.target.value,
                          description: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label={`${cluster.slug} English description`}
                      className={adminFieldClassName}
                      placeholder="Cluster description (EN)"
                      defaultValue={cluster.description_en}
                      onChange={(event) =>
                        clusterEdits.current.set(cluster.id, {
                          ...(clusterEdits.current.get(cluster.id) ?? cluster),
                          description_en: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:flex-col sm:justify-center">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        const next =
                          clusterEdits.current.get(cluster.id) ?? cluster;
                        void updateCluster(cluster.id, {
                          slug: next.slug,
                          title_id: next.title_id,
                          title_en: next.title_en,
                          description_id: next.description_id,
                          description_en: next.description_en,
                          sort_order: next.sort_order,
                          active: next.active,
                        });
                      }}
                      className="hover:text-navy"
                    >
                      <Save className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => void deleteCluster(cluster.id)}
                      className="hover:text-destructive text-muted-foreground"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <details className="border-border/80 bg-muted/15 mt-3.5 rounded-xl border p-3.5 transition-all">
              <summary className="text-navy cursor-pointer text-xs font-bold uppercase tracking-wider">{t('learningHubClusterEditor')}</summary>
              <div className="mt-3 space-y-3">
                <NativeSelect
                  value={editingCluster?.id ?? ''}
                  onChange={(event) =>
                    setEditingCluster(
                      (taxonomy?.clusters ?? []).find(
                        (cluster) => cluster.id === event.target.value
                      ) ?? null
                    )
                  }
                >
                  <option value="">{t('learningHubSelectCluster')}</option>
                  {(taxonomy?.clusters ?? []).map((cluster) => (
                    <option key={cluster.id} value={cluster.id}>
                      {cluster.title_id} ({cluster.slug})
                    </option>
                  ))}
                </NativeSelect>
                {editingCluster ? (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      aria-label="Cluster slug"
                      className={adminFieldClassName}
                      value={editingCluster.slug}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          slug: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Cluster sort order"
                      className={adminFieldClassName}
                      type="number"
                      value={editingCluster.sort_order}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          sort_order: Number(event.target.value),
                        })
                      }
                    />
                    <input
                      aria-label="Cluster Indonesian title"
                      className={adminFieldClassName}
                      value={editingCluster.title_id}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          title_id: event.target.value,
                          title: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Cluster English title"
                      className={adminFieldClassName}
                      value={editingCluster.title_en}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          title_en: event.target.value,
                        })
                      }
                    />
                    <textarea
                      aria-label="Cluster Indonesian description"
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      value={editingCluster.description_id}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          description_id: event.target.value,
                          description: event.target.value,
                        })
                      }
                    />
                    <textarea
                      aria-label="Cluster English description"
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      value={editingCluster.description_en}
                      onChange={(event) =>
                        setEditingCluster({
                          ...editingCluster,
                          description_en: event.target.value,
                        })
                      }
                    />
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <TranslateButton
                        sourceLang="id"
                        targetLang="en"
                        sourceTexts={[
                          editingCluster.title_id,
                          editingCluster.description_id,
                        ]}
                        onTranslated={([title, desc]) => {
                          setEditingCluster({
                            ...editingCluster,
                            title_en: title,
                            description_en: desc,
                          });
                        }}
                      />
                      <TranslateButton
                        sourceLang="en"
                        targetLang="id"
                        sourceTexts={[
                          editingCluster.title_en,
                          editingCluster.description_en,
                        ]}
                        onTranslated={([title, desc]) => {
                          setEditingCluster({
                            ...editingCluster,
                            title_id: title,
                            description_id: desc,
                          });
                        }}
                      />
                    </div>
                    <label className="text-muted-foreground flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editingCluster.active}
                        onChange={(event) =>
                          setEditingCluster({
                            ...editingCluster,
                            active: event.target.checked,
                          })
                        }
                      />{t('learningHubActiveInCatalog')}</label>
                    <Button
                      onClick={() => void saveCluster()}
                      disabled={busy}
                      className="rounded-xl font-bold"
                    >
                      <Save className="size-4" />
                      {t('learningHubSave')}
                    </Button>
                  </div>
                ) : null}
              </div>
            </details>
          </div>

          <div className="border-border/60 mt-4 pt-3.5 border-t grid gap-2 sm:grid-cols-2">
            <input
              className={adminFieldClassName}
              placeholder="slug-klaster (mis. sains-data)"
              value={newCluster.slug}
              onChange={(event) =>
                setNewCluster({ ...newCluster, slug: event.target.value })
              }
            />
            <input
              className={adminFieldClassName}
              placeholder="Judul klaster ID (mis. Sains Data)"
              value={newCluster.title_id}
              onChange={(event) =>
                setNewCluster({ ...newCluster, title_id: event.target.value })
              }
            />
            <input
              className={adminFieldClassName}
              placeholder="Cluster title EN (e.g. Data Science)"
              value={newCluster.title_en}
              onChange={(event) =>
                setNewCluster({ ...newCluster, title_en: event.target.value })
              }
            />
            <Button
              variant="outline"
              onClick={() => void createTaxonomy('cluster')}
              disabled={busy}
              className="rounded-xl font-medium"
            >
              <Plus className="size-4" />
              {t('learningHubAdd')}
            </Button>
          </div>
        </section>

        <section className="border-border/80 bg-card rounded-2xl border p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-navy text-sm font-bold">{t('learningHubPrograms')}</h3>
              <span className="text-[0.6875rem] font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/60">
                {taxonomy?.programs ?? [] ? taxonomy?.programs?.length : 0} program
              </span>
            </div>

            <div className="mt-3 max-h-[360px] overflow-y-auto pr-1.5 space-y-2.5 min-h-0 focus:outline-none">
              {(taxonomy?.programs ?? []).map((program) => (
                <div
                  key={program.id}
                  className="border-border/80 bg-muted/20 hover:bg-muted/35 hover:border-navy/20 grid gap-2.5 rounded-xl border p-3.5 shadow-2xs transition-all sm:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    className={adminFieldClassName}
                    placeholder="Nama program studi"
                    defaultValue={program.name}
                    onChange={(event) =>
                      programEdits.current.set(program.id, {
                        ...(programEdits.current.get(program.id) ?? program),
                        name: event.target.value,
                      })
                    }
                  />
                  <span className="text-muted-foreground self-center font-mono text-xs">
                    {program.slug}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => {
                        const next =
                          programEdits.current.get(program.id) ?? program;
                        void updateProgram(program.id, {
                          slug: next.slug,
                          name: next.name,
                          degree: next.degree,
                          primary_cluster_slug: next.primary_cluster_slug,
                          sort_order: next.sort_order,
                          active: next.active,
                        });
                      }}
                      className="hover:text-navy"
                    >
                      <Save className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => void deleteProgram(program.id)}
                      className="hover:text-destructive text-muted-foreground"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <details className="border-border/80 bg-muted/15 mt-3.5 rounded-xl border p-3.5 transition-all">
              <summary className="text-navy cursor-pointer text-xs font-bold uppercase tracking-wider">{t('learningHubProgramEditor')}</summary>
              <div className="mt-3 space-y-3">
                <NativeSelect
                  value={editingProgram?.id ?? ''}
                  onChange={(event) =>
                    setEditingProgram(
                      (taxonomy?.programs ?? []).find(
                        (program) => program.id === event.target.value
                      ) ?? null
                    )
                  }
                >
                  <option value="">{t('learningHubSelectProgram')}</option>
                  {(taxonomy?.programs ?? []).map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.slug})
                    </option>
                  ))}
                </NativeSelect>
                {editingProgram ? (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      aria-label="Program slug"
                      className={adminFieldClassName}
                      placeholder="s1-informatika"
                      value={editingProgram.slug}
                      onChange={(event) =>
                        setEditingProgram({
                          ...editingProgram,
                          slug: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Program name"
                      className={adminFieldClassName}
                      placeholder="Nama program studi (mis. S1 Informatika)"
                      value={editingProgram.name}
                      onChange={(event) =>
                        setEditingProgram({
                          ...editingProgram,
                          name: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Program degree"
                      className={adminFieldClassName}
                      placeholder="Jenjang (mis. S1 / D3 / S2)"
                      value={editingProgram.degree}
                      onChange={(event) =>
                        setEditingProgram({
                          ...editingProgram,
                          degree: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Primary cluster slug"
                      className={adminFieldClassName}
                      placeholder="Slug klaster utama (mis. teknologi-informasi)"
                      value={editingProgram.primary_cluster_slug}
                      onChange={(event) =>
                        setEditingProgram({
                          ...editingProgram,
                          primary_cluster_slug: event.target.value,
                        })
                      }
                    />
                    <input
                      aria-label="Program sort order"
                      className={adminFieldClassName}
                      type="number"
                      placeholder="0"
                      value={editingProgram.sort_order}
                      onChange={(event) =>
                        setEditingProgram({
                          ...editingProgram,
                          sort_order: Number(event.target.value),
                        })
                      }
                    />
                    <label className="text-muted-foreground flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={editingProgram.active}
                        onChange={(event) =>
                          setEditingProgram({
                            ...editingProgram,
                            active: event.target.checked,
                          })
                        }
                      />{t('learningHubActiveInCatalog')}</label>
                    <Button
                      onClick={() => void saveProgram()}
                      disabled={busy}
                      className="rounded-xl font-bold"
                    >
                      <Save className="size-4" />
                      {t('learningHubSave')}
                    </Button>
                  </div>
                ) : null}
              </div>
            </details>
          </div>

          <div className="border-border/60 mt-4 pt-3.5 border-t grid gap-2 sm:grid-cols-2">
            <input
              className={adminFieldClassName}
              placeholder="slug-program (mis. s1-informatika)"
              value={newProgram.slug}
              onChange={(event) =>
                setNewProgram({ ...newProgram, slug: event.target.value })
              }
            />
            <input
              className={adminFieldClassName}
              placeholder="Nama program studi (mis. S1 Informatika)"
              value={newProgram.name}
              onChange={(event) =>
                setNewProgram({ ...newProgram, name: event.target.value })
              }
            />
            <input
              className={adminFieldClassName}
              placeholder="Cluster slug (mis. teknologi-informasi)"
              value={newProgram.primary_cluster_slug}
              onChange={(event) =>
                setNewProgram({
                  ...newProgram,
                  primary_cluster_slug: event.target.value,
                })
              }
            />
            <Button
              variant="outline"
              onClick={() => void createTaxonomy('program')}
              disabled={busy}
              className="rounded-xl font-medium"
            >
              <Plus className="size-4" />
              {t('learningHubAdd')}
            </Button>
          </div>
        </section>
      </div>
      )}

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('learningHubHistory')}</DialogTitle>
            <DialogDescription>
              {t('learningHubHistoryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="border-border/80 flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="text-xs font-bold">
                    v{revision.revision} •{' '}
                    {new Date(revision.created_at).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {revision.kind}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRollbackRevision(revision);
                    setRollbackOpen(true);
                  }}
                >
                  {t('learningHubRollback')}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('learningHubRollback')}</DialogTitle>
            <DialogDescription>
              {t('learningHubRollbackDescription')}
            </DialogDescription>
          </DialogHeader>
          <label className="space-y-1.5">
            <span className="text-navy flex items-center text-xs font-bold">
              <span>{t('reasonPrompt')}</span>
              <RequiredMark />
            </span>
            <textarea
              className={`${adminFieldClassName} py-2`}
              rows={4}
              value={rollbackReason}
              onChange={(event) => setRollbackReason(event.target.value)}
              placeholder="Contoh: Pemulihan draf untuk memperbarui referensi kurikulum terbaru..."
              required
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => void rollback()}
              disabled={busy || !rollbackReason.trim()}
            >
              {t('learningHubRollback')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
