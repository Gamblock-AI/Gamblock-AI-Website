'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Archive,
  BookOpen,
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
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function collectItemTexts(draft: Draft, locale: string): string[] {
  const suffix = `_${locale}`;
  const texts: string[] = [
    draft[`title${suffix}` as keyof Draft] as string ?? '',
    draft[`summary${suffix}` as keyof Draft] as string ?? '',
  ];
  const outcomes = draft.document[`outcomes${suffix}`] ?? [];
  if (Array.isArray(outcomes)) {
    for (const o of outcomes) {
      if (typeof o === 'string') texts.push(o);
    }
  }
  return texts;
}

function applyItemTranslations(draft: Draft, locale: string, translations: string[]): void {
  let idx = 0;
  const next = (): string => translations[idx++] ?? '';
  const suffix = `_${locale}`;
  (draft as Record<string, unknown>)[`title${suffix}`] = next();
  (draft as Record<string, unknown>)[`summary${suffix}`] = next();
  const outcomes = draft.document[`outcomes${suffix}`] ?? [];
  if (Array.isArray(outcomes)) {
    const mapped: string[] = [];
    for (const o of outcomes) {
      mapped.push(typeof o === 'string' ? next() : String(o));
    }
    draft.document[`outcomes${suffix}`] = mapped;
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
      .filter((item): item is string => typeof item === 'string')
      .join('\n');
  return typeof value === 'string' ? value : '';
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

function LearningMediaField({
  label,
  help,
  mediaID,
  uploading,
  onUpload,
  onChange,
}: {
  label: string;
  help?: string;
  mediaID: string;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onChange: (value: string) => void;
}) {
  const t = useTranslations('adminPage');
  const inputRef = useRef<HTMLInputElement>(null);
  const source = mediaID ? resolveEducationMediaURL(`/v1/education/media/${mediaID}`) : '';
  return (
    <label className="space-y-2">
      <span className="text-navy text-xs font-bold">{label}</span>
      {help ? <span className="text-muted-foreground block text-xs">{help}</span> : null}
      <div className="flex items-center gap-3">
        {source ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source}
            alt=""
            className="border-border h-14 w-20 rounded-lg border object-cover"
          />
        ) : (
          <span className="border-border text-muted-foreground flex h-14 w-20 items-center justify-center rounded-lg border text-xs">
            -
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
            event.target.value = '';
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? '...' : t('learningHubUpload')}
        </Button>
        {mediaID ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange('')}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </label>
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
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const section = sectionParam === 'taxonomy' ? 'taxonomy' : 'items';
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<AdminLearningHubItem | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>(() => emptyDraft());
  const [isCreateSlugCustom, setIsCreateSlugCustom] = useState(false);
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

  const visibleItems = useMemo(
    () => (filter ? items.filter((item) => item.status === filter) : items),
    [filter, items]
  );
  const createReady =
    [
      createDraft.title_id,
      createDraft.title_en,
      createDraft.summary_id,
      createDraft.summary_en,
    ].every((value) => value.trim().length > 0) &&
    slugPattern.test(createDraft.slug);

  const selectItem = (item: AdminLearningHubItem) => {
    setSelected(item);
    setDraft(itemDraft(item));
  };

  const updateDraft = (next: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...next } : current));
  const updateDoc = (key: string, value: string | number | string[]) =>
    setDraft((current) =>
      current ? editDocument(current, key, value) : current
    );

  const save = async () => {
    if (!selected || !draft) return;
    setBusy(true);
    try {
      const saved = await saveItem(
        selected,
        draft as unknown as Record<string, unknown>
      );
      setSelected(saved);
      setDraft(itemDraft(saved));
      toastSuccess(t('learningHubSaved'));
    } catch (error) {
      toastError(error, t('learningHubSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    setBusy(true);
    try {
      const created = await createItem(
        createDraft as unknown as Record<string, unknown>
      );
      setSelected(created);
      setDraft(itemDraft(created));
      setCreateDraft(emptyDraft());
      setIsCreateSlugCustom(false);
      setCreateOpen(false);
      toastSuccess(t('learningHubCreated'));
    } catch (error) {
      toastError(error, t('learningHubSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const transition = async (
    action: 'submit-review' | 'publish' | 'archive'
  ) => {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await transitionItem(selected.id, action);
      setSelected(updated);
      setDraft(itemDraft(updated));
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
            <Button onClick={() => setCreateOpen(true)} disabled={busy}>
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
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectItem(item)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all duration-150',
                  selected?.id === item.id
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
            {!visibleItems.length ? (
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
          {!selected || !draft ? (
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
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border-border/60 bg-muted/70 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[0.6875rem] font-semibold">
                      {selected.slug}
                    </span>
                    <span className="text-muted-foreground font-mono text-[0.6875rem]">
                      rev {selected.draft_revision}
                    </span>
                  </div>
                  <h2 className="text-navy mt-1 text-lg font-bold">
                    {draft.title_id ||
                      draft.slug ||
                      t('learningHubEditorTitle')}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <AdminStatusBadge status={selected.status} />
                </div>
              </div>

              {/* Translation utility bar */}
              <div className="border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
                <span className="text-navy text-xs font-semibold">
                  {t('learningHubAutoTranslation')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <TranslateButton
                    sourceLang="id"
                    targetLang="en"
                    sourceTexts={collectItemTexts(draft, 'id')}
                    onTranslated={(translations) => {
                      applyItemTranslations(draft, 'en', translations);
                      setDraft({ ...draft });
                    }}
                  />
                  <TranslateButton
                    sourceLang="en"
                    targetLang="id"
                    sourceTexts={collectItemTexts(draft, 'en')}
                    onTranslated={(translations) => {
                      applyItemTranslations(draft, 'id', translations);
                      setDraft({ ...draft });
                    }}
                  />
                </div>
              </div>

              {/* Subsection 1: Basic Information */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('learningHubBasicInfo')}
                </h3>
                <div className="border-border/70 bg-muted/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubSlug')}</span>
                    <input
                      className={adminFieldClassName}
                      placeholder="analisis-data-statistika-terapan"
                      value={draft.slug}
                      onChange={(event) =>
                        updateDraft({ slug: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubKind')}
                    </span>
                    <NativeSelect
                      value={draft.kind}
                      onChange={(event) =>
                        updateDraft({ kind: event.target.value })
                      }
                    >
                      {kinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {t(`learningHubKind_${kind}`)}
                        </option>
                      ))}
                    </NativeSelect>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubTitleId')}
                    </span>
                    <input
                      className={adminFieldClassName}
                      placeholder="Contoh: Pengenalan Analisis Data & Statistika Terapan"
                      value={draft.title_id}
                      onChange={(event) =>
                        updateDraft({ title_id: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubTitleEn')}
                    </span>
                    <input
                      className={adminFieldClassName}
                      placeholder="e.g. Introduction to Data Analysis & Applied Statistics"
                      value={draft.title_en}
                      onChange={(event) =>
                        updateDraft({ title_en: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubSummaryId')}
                    </span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      placeholder="Contoh: Ringkasan singkat materi mengenai silabus, target kompetensi, dan capaian pembelajaran..."
                      value={draft.summary_id}
                      onChange={(event) =>
                        updateDraft({ summary_id: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubSummaryEn')}
                    </span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      placeholder="e.g. Brief summary covering the syllabus, target competencies, and learning outcomes..."
                      value={draft.summary_en}
                      onChange={(event) =>
                        updateDraft({ summary_en: event.target.value })
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Subsection 2: Provider, Media, and Details */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">
                  {t('learningHubProviderMedia')}
                </h3>
                <div className="border-border/70 bg-muted/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubProvider')}
                    </span>
                    <input
                      className={adminFieldClassName}
                      placeholder="Contoh: Dicoding, Coursera, MIT OpenCourseWare"
                      value={text(draft.document, 'provider')}
                      onChange={(event) =>
                        updateDoc('provider', event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubSourceUrl')}
                    </span>
                    <input
                      className={adminFieldClassName}
                      type="url"
                      placeholder="https://www.dicoding.com/academies/..."
                      value={text(draft.document, 'url')}
                      onChange={(event) => updateDoc('url', event.target.value)}
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('providerDescriptionId')}
                    </span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      maxLength={200}
                      placeholder="Contoh: Platform edukasi teknologi terkemuka dengan kurikulum terstandarisasi industri..."
                      value={text(draft.document, 'provider_description_id')}
                      onChange={(event) =>
                        updateDoc('provider_description_id', event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('providerDescriptionEn')}
                    </span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={2}
                      maxLength={200}
                      placeholder="e.g. Leading technology education platform offering industry-standard curriculums..."
                      value={text(draft.document, 'provider_description_en')}
                      onChange={(event) =>
                        updateDoc('provider_description_en', event.target.value)
                      }
                    />
                  </label>
                  <LearningMediaField
                    label={t('learningHubProviderLogo')}
                    help={t('learningHubProviderLogoHelp')}
                    mediaID={text(draft.document, 'provider_logo_media_id')}
                    uploading={mediaUploading}
                    onUpload={async (file) => {
                      setMediaUploading(true);
                      try {
                        const media = await uploadEducationMedia(
                          file,
                          'thumbnail'
                        );
                        updateDoc('provider_logo_media_id', media.id);
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
                    uploading={mediaUploading}
                    onUpload={async (file) => {
                      setMediaUploading(true);
                      try {
                        const media = await uploadEducationMedia(
                          file,
                          'thumbnail'
                        );
                        updateDoc('thumbnail_media_id', media.id);
                      } catch {
                        toastError(t('learningHubThumbnailError'));
                      } finally {
                        setMediaUploading(false);
                      }
                    }}
                    onChange={(value) => updateDoc('thumbnail_media_id', value)}
                  />
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">
                      {t('learningHubDurationMinutes')}
                    </span>
                    <input
                      className={adminFieldClassName}
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
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubReviewer')}</span>
                    <input
                      className={adminFieldClassName}
                      placeholder="Contoh: Dr. Budi Santoso, M.Kom. / Tim Kurikulum"
                      value={text(draft.document, 'reviewer_name')}
                      onChange={(event) =>
                        updateDoc('reviewer_name', event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-navy text-xs font-bold">{t('learningHubReviewedAt')}</span>
                    <input
                      className={adminFieldClassName}
                      type="date"
                      value={text(draft.document, 'reviewed_at')}
                      onChange={(event) =>
                        updateDoc('reviewed_at', event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Subsection 3: Outcomes & Taxonomy Slugs */}
              <div className="space-y-3">
                <h3 className="text-navy text-xs font-bold uppercase tracking-wider">{t('learningHubOutcomesTaxonomy')}</h3>
                <div className="border-border/70 bg-muted/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubOutcomesId')}</span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={3}
                      placeholder={`Contoh:\nMemahami konsep dasar analisis data\nMampu memvisualisasikan data kuantitatif\nMenerapkan analisis regresi pada studi kasus`}
                      value={list(draft.document, 'outcomes_id')}
                      onChange={(event) =>
                        updateDoc(
                          'outcomes_id',
                          event.target.value
                            .split('\n')
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubOutcomesEn')}</span>
                    <textarea
                      className={`${adminFieldClassName} py-2`}
                      rows={3}
                      placeholder={`e.g.:\nUnderstand fundamental data analysis concepts\nAble to visualize quantitative datasets\nApply regression analysis in case studies`}
                      value={list(draft.document, 'outcomes_en')}
                      onChange={(event) =>
                        updateDoc(
                          'outcomes_en',
                          event.target.value
                            .split('\n')
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubClusterSlugs')}</span>
                    <input
                      className={adminFieldClassName}
                      placeholder="teknologi-informasi, sains-data"
                      value={list(draft.document, 'clusters').replace(
                        /\n/g,
                        ', '
                      )}
                      onChange={(event) =>
                        updateDoc(
                          'clusters',
                          event.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-navy text-xs font-bold">{t('learningHubProgramSlugs')}</span>
                    <input
                      className={adminFieldClassName}
                      placeholder="s1-informatika, s1-sistem-informasi"
                      value={list(draft.document, 'programs').replace(
                        /\n/g,
                        ', '
                      )}
                      onChange={(event) =>
                        updateDoc(
                          'programs',
                          event.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Action Bar */}
              <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => void save()}
                    disabled={busy}
                    className="shadow-soft rounded-xl font-bold"
                  >
                    <Save className="size-4" />
                    {t('learningHubSave')}
                  </Button>
                  {selected.status === 'draft' ? (
                    <Button
                      variant="outline"
                      onClick={() => void transition('submit-review')}
                      disabled={busy}
                      className="rounded-xl font-medium"
                    >
                      <Send className="size-4" />
                      {t('learningHubSubmit')}
                    </Button>
                  ) : null}
                  {selected.status === 'in_review' ? (
                    <Button
                      onClick={() => void transition('publish')}
                      disabled={busy}
                      className="shadow-soft rounded-xl font-bold"
                    >
                      <Send className="size-4" />
                      {t('learningHubPublish')}
                    </Button>
                  ) : null}
                  {selected.status === 'published' ||
                  selected.status === 'in_review' ? (
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
                <Button
                  variant="ghost"
                  onClick={() => void openHistory()}
                  disabled={busy}
                  className="text-muted-foreground hover:text-navy rounded-xl font-medium"
                >
                  <History className="size-4" />
                  {t('learningHubHistory')}
                </Button>
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

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (busy) return;
          setCreateOpen(open);
          if (!open) {
            setCreateDraft(emptyDraft());
            setIsCreateSlugCustom(false);
          }
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('learningHubNewItem')}</DialogTitle>
            <DialogDescription>
              {t('learningHubCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">{t('learningHubTitleId')}</span>
              <input
                className={adminFieldClassName}
                placeholder="Contoh: Pengenalan Analisis Data & Statistika Terapan"
                value={createDraft.title_id}
                onChange={(event) => {
                  const newTitle = event.target.value;
                  setCreateDraft((current) => ({
                    ...current,
                    title_id: newTitle,
                    ...(!isCreateSlugCustom
                      ? { slug: slugify(newTitle || current.title_en) }
                      : {}),
                  }));
                }}
              />
            </label>
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">{t('learningHubTitleEn')}</span>
              <input
                className={adminFieldClassName}
                placeholder="e.g. Introduction to Data Analysis & Applied Statistics"
                value={createDraft.title_en}
                onChange={(event) => {
                  const newTitle = event.target.value;
                  setCreateDraft((current) => ({
                    ...current,
                    title_en: newTitle,
                    ...(!isCreateSlugCustom && !current.title_id
                      ? { slug: slugify(newTitle) }
                      : {}),
                  }));
                }}
              />
            </label>
            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-navy text-xs font-bold">Slug</span>
                {isCreateSlugCustom ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateSlugCustom(false);
                      setCreateDraft((current) => ({
                        ...current,
                        slug: slugify(current.title_id || current.title_en),
                      }));
                    }}
                    className="text-navy text-[0.7rem] hover:underline"
                  >{t('learningHubAutoSlug')}</button>
                ) : null}
              </div>
              <input
                className={adminFieldClassName}
                placeholder="pengenalan-analisis-data-statistika-terapan"
                pattern="[a-z0-9-]+"
                value={createDraft.slug}
                onChange={(event) => {
                  setIsCreateSlugCustom(true);
                  setCreateDraft((current) => ({
                    ...current,
                    slug: event.target.value,
                  }));
                }}
              />
            </label>
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">
                {t('learningHubKind')}
              </span>
              <NativeSelect
                value={createDraft.kind}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    kind: event.target.value,
                  }))
                }
              >
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {t(`learningHubKind_${kind}`)}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">
                {t('learningHubSummaryId')}
              </span>
              <textarea
                className={`${adminFieldClassName} py-2`}
                rows={3}
                placeholder="Contoh: Ringkasan materi mengenai metodologi analisis data, interpretasi visual, dan studi kasus praktis..."
                value={createDraft.summary_id}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    summary_id: event.target.value,
                  }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">
                {t('learningHubSummaryEn')}
              </span>
              <textarea
                className={`${adminFieldClassName} py-2`}
                rows={3}
                placeholder="e.g. Course summary covering data analysis methodology, visual interpretation, and practical case studies..."
                value={createDraft.summary_en}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    summary_en: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setIsCreateSlugCustom(false);
                setCreateDraft(emptyDraft());
              }}
              disabled={busy}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void create()}
              disabled={busy || !createReady}
            >
              <Plus className="size-4" />
              {t('learningHubCreateDraft')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('learningHubHistory')}</DialogTitle>
            <DialogDescription>
              {t('learningHubHistoryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="border-border flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div>
                  <p className="text-navy text-sm font-bold">
                    rev {revision.revision} ·{' '}
                    {t.has(`learningHubKind_${revision.kind}`)
                      ? t(`learningHubKind_${revision.kind}`)
                      : revision.kind}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(revision.created_at).toLocaleString()}
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
          <textarea
            className={`${adminFieldClassName} py-2`}
            rows={4}
            value={rollbackReason}
            onChange={(event) => setRollbackReason(event.target.value)}
            placeholder="Contoh: Pemulihan draf untuk memperbarui referensi kurikulum terbaru..."
          />
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
