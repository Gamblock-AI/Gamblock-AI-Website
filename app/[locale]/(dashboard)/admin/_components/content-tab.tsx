'use client';

import { useState } from 'react';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  ExternalLink,
  History,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type {
  AdminEducationDocument,
  AdminEducationMedia,
  AdminEducationModule,
  AdminEducationRevision,
  AdminModuleDraft,
} from '@/hooks/use-admin-operations';
import type { EditorMediaSelection } from '@/components/education/rich-text-editor';
import { RichTextEditor } from '@/components/education/rich-text-editor';
import { ThumbnailCropper } from '@/components/education/thumbnail-cropper';
import { config } from '@/lib/config';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
  educationCategoryCodes,
} from '@/lib/i18n/dynamic-labels';
import {
  AdminSectionHeader,
  AdminStatusBadge,
  adminFieldClassName,
} from './admin-shared';

const emptyRichText = () => ({ type: 'doc', content: [{ type: 'paragraph' }] });
const makeCheck = (id: string) => ({
  id,
  question: '',
  choices: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
  ],
  correct_choice_id: 'a',
  explanation: '',
  required: true,
});
const makeSection = (order: number) => {
  const sectionID = `section-${crypto.randomUUID().slice(0, 8)}`;
  const checkID = `check-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id: sectionID,
    sort_order: order,
    required: true,
    translations: {
      id: {
        title: '',
        content: emptyRichText(),
        knowledge_check: makeCheck(checkID),
      },
      en: {
        title: '',
        content: emptyRichText(),
        knowledge_check: makeCheck(checkID),
      },
    },
  };
};
const makeDocument = (idTitle = '', enTitle = ''): AdminEducationDocument => ({
  audience: 'student',
  experience_type: 'article',
  category: 'impulse-awareness',
  estimated_minutes: 8,
  reviewer_name: '',
  reviewer_role: '',
  reviewed_at: new Date().toISOString().slice(0, 10),
  translations: {
    id: {
      title: idTitle,
      summary: '',
      learning_objective: '',
      disclaimer: '',
      reviewer_role: '',
    },
    en: {
      title: enTitle,
      summary: '',
      learning_objective: '',
      disclaimer: '',
      reviewer_role: '',
    },
  },
  sections: [makeSection(0)],
  thumbnails: [],
  sources: [
    {
      title: '',
      publisher: '',
      url: 'https://',
      accessed_at: new Date().toISOString(),
    },
  ],
});

function normalizeEducationDocument(document: AdminEducationDocument) {
  const normalized = structuredClone(document);
  normalized.audience ||= 'all';
  normalized.experience_type ||= 'article';
  for (const locale of ['id', 'en'] as const) {
    normalized.translations[locale].reviewer_role ||= document.reviewer_role;
  }
  return normalized;
}

interface ContentTabProps {
  modules: AdminEducationModule[];
  createModule: (module: AdminModuleDraft) => Promise<AdminEducationModule>;
  getModule: (id: string) => Promise<AdminEducationModule>;
  saveModule: (
    module: AdminEducationModule,
    slug: string,
    document: AdminEducationDocument
  ) => Promise<AdminEducationModule>;
  transitionModule: (
    id: string,
    action: 'submit-review' | 'publish' | 'archive'
  ) => Promise<AdminEducationModule>;
  uploadEducationMedia: (
    file: File,
    purpose: 'thumbnail' | 'content'
  ) => Promise<AdminEducationMedia>;
  registerExternalEducationMedia: (
    url: string,
    type: 'image' | 'video' | 'pdf'
  ) => Promise<AdminEducationMedia>;
  getModuleRevisions: (id: string) => Promise<AdminEducationRevision[]>;
  rollbackModule: (
    moduleID: string,
    revisionID: string,
    reason: string
  ) => Promise<AdminEducationModule>;
}

export function ContentTab(props: ContentTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const [selected, setSelected] = useState<AdminEducationModule | null>(null);
  const [slug, setSlug] = useState('');
  const [document, setDocument] = useState<AdminEducationDocument | null>(null);
  const [locale, setLocale] = useState<'id' | 'en'>('id');
  const [busy, setBusy] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newIDTitle, setNewIDTitle] = useState('');
  const [newENTitle, setNewENTitle] = useState('');
  const [revisions, setRevisions] = useState<AdminEducationRevision[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const openModule = async (id: string) => {
    setBusy(true);
    try {
      const educationModule = await props.getModule(id);
      setSelected(educationModule);
      setSlug(educationModule.slug);
      setDocument(normalizeEducationDocument(educationModule.draft_document));
    } catch (error) {
      toastError(error, t('fetchError'));
    } finally {
      setBusy(false);
    }
  };
  const mutate = (callback: (draft: AdminEducationDocument) => void) =>
    setDocument((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      callback(next);
      return next;
    });
  const save = async () => {
    if (!selected || !document) return;
    setBusy(true);
    try {
      const educationModule = await props.saveModule(selected, slug, document);
      setSelected(educationModule);
      setDocument(normalizeEducationDocument(educationModule.draft_document));
      toastSuccess(t('moduleSaved'));
    } catch (error) {
      toastError(error, t('moduleSaveError'));
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
      const educationModule = await props.transitionModule(selected.id, action);
      setSelected(educationModule);
      toastSuccess(
        t(
          action === 'publish'
            ? 'modulePublished'
            : action === 'archive'
              ? 'moduleArchived'
              : 'moduleSubmitted'
        )
      );
    } catch (error) {
      toastError(error, t('moduleTransitionError'));
    } finally {
      setBusy(false);
    }
  };
  const openHistory = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      setRevisions(await props.getModuleRevisions(selected.id));
      setHistoryOpen(true);
    } catch (error) {
      toastError(error, t('fetchError'));
    } finally {
      setBusy(false);
    }
  };
  const rollback = async (revisionID: string) => {
    if (!selected) return;
    const reason = window.prompt(t('rollbackReasonPrompt'));
    if (!reason) return;
    setBusy(true);
    try {
      const updated = await props.rollbackModule(
        selected.id,
        revisionID,
        reason
      );
      setSelected(updated);
      setSlug(updated.slug);
      setDocument(normalizeEducationDocument(updated.draft_document));
      setHistoryOpen(false);
      toastSuccess(t('rollbackSuccess'));
    } catch (error) {
      toastError(error, t('rollbackError'));
    } finally {
      setBusy(false);
    }
  };
  const uploadThumb = async (file: File) => {
    setBusy(true);
    try {
      const media = await props.uploadEducationMedia(file, 'thumbnail');
      mutate((draft) =>
        draft.thumbnails.push({
          media_id: media.id,
          sort_order: draft.thumbnails.length,
          alt_text: { id: '', en: '' },
        })
      );
      toastSuccess(t('mediaUploaded'));
    } catch (error) {
      toastError(error, t('mediaUploadError'));
    } finally {
      setBusy(false);
    }
  };
  const requestContentMedia =
    async (): Promise<EditorMediaSelection | null> => {
      const useExternal = window.confirm(t('externalMediaQuestion'));
      let media: AdminEducationMedia | null = null;
      try {
        if (useExternal) {
          const url = window.prompt(t('externalMediaURL'), 'https://');
          if (!url) return null;
          const type = (window.prompt(t('externalMediaType'), 'video') ??
            'video') as 'image' | 'video' | 'pdf';
          if (!['image', 'video', 'pdf'].includes(type)) return null;
          media = await props.registerExternalEducationMedia(url, type);
        } else {
          const file = await new Promise<File | null>((resolve) => {
            const input = window.document.createElement('input');
            input.type = 'file';
            input.accept =
              'image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf';
            input.onchange = () => resolve(input.files?.[0] ?? null);
            input.click();
          });
          if (!file) return null;
          media = await props.uploadEducationMedia(file, 'content');
        }
        const alt = window.prompt(t('mediaAltPrompt'), '') ?? '';
        const required = window.confirm(t('mediaRequiredQuestion'));
        return { id: media.id, type: media.media_type, alt, required };
      } catch (error) {
        toastError(error, t('mediaUploadError'));
        return null;
      }
    };

  if (!selected || !document)
    return (
      <div className="space-y-4">
        <AdminSectionHeader
          title={t('contentTitle')}
          description={t('contentDescription')}
          action={
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" />
              {t('newModule')}
            </Button>
          }
        />
        {newOpen ? (
          <form
            className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                const educationModule = await props.createModule({
                  slug: newSlug,
                  document: makeDocument(newIDTitle, newENTitle),
                });
                setNewOpen(false);
                await openModule(educationModule.id);
                toastSuccess(t('moduleCreated'));
              } catch (error) {
                toastError(error, t('moduleCreateError'));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">{t('thSlug')}</span>
              <input
                className={adminFieldClassName}
                pattern="[a-z0-9-]+"
                value={newSlug}
                onChange={(event) => setNewSlug(event.target.value)}
                required
              />
            </label>
            <div />
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">
                {t('titleIndonesian')}
              </span>
              <input
                className={adminFieldClassName}
                value={newIDTitle}
                onChange={(event) => setNewIDTitle(event.target.value)}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-navy text-xs font-bold">
                {t('titleEnglish')}
              </span>
              <input
                className={adminFieldClassName}
                value={newENTitle}
                onChange={(event) => setNewENTitle(event.target.value)}
                required
              />
            </label>
            <div className="flex gap-2 sm:col-span-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button disabled={busy}>{t('saveDraft')}</Button>
            </div>
          </form>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {props.modules.length ? (
            props.modules.map((module) => (
              <button
                type="button"
                key={module.id}
                onClick={() => void openModule(module.id)}
                className="border-border bg-card shadow-soft rounded-2xl border p-5 text-left outline-none hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-600/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <BookOpen className="size-5 text-blue-700" />
                  <AdminStatusBadge status={module.status} />
                </div>
                <h3 className="text-navy mt-4 font-bold">
                  {module.title || module.slug}
                </h3>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {module.slug}
                </p>
                <p className="mt-4 text-xs font-semibold text-blue-700">
                  {t('editModule')} →
                </p>
              </button>
            ))
          ) : (
            <p className="border-border text-muted-foreground col-span-full rounded-2xl border border-dashed p-10 text-center text-sm">
              {t('noModules')}
            </p>
          )}
        </div>
      </div>
    );

  const translation = document.translations[locale];
  return (
    <div className="space-y-5">
      <div className="border-border bg-card/95 shadow-card sticky top-16 z-20 flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setDocument(null);
            }}
            className="hover:bg-muted flex size-10 items-center justify-center rounded-xl"
            aria-label={t('closeEditor')}
          >
            <X className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-navy font-extrabold">
                {translation.title || slug}
              </h2>
              <AdminStatusBadge status={selected.status} />
            </div>
            <p className="text-muted-foreground text-xs">
              {t('draftRevision', { revision: selected.draft_revision })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void openHistory()}
          >
            <History className="size-4" />
            {t('revisionHistory')}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void transition('archive')}
          >
            <Archive className="size-4" />
            {t('archive')}
          </Button>
          <Button
            variant="outline"
            disabled={busy || selected.status !== 'draft'}
            onClick={() => void transition('submit-review')}
          >
            <Send className="size-4" />
            {t('submitReview')}
          </Button>
          <Button
            variant="outline"
            disabled={busy || selected.status !== 'in_review'}
            onClick={() => void transition('publish')}
          >
            <Upload className="size-4" />
            {t('publish')}
          </Button>
          <Button disabled={busy} onClick={() => void save()}>
            <Save className="size-4" />
            {t('saveDraft')}
          </Button>
        </div>
      </div>

      {historyOpen ? (
        <section className="border-border bg-card rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-navy font-extrabold">
                {t('revisionHistory')}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('revisionHistoryHelp')}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHistoryOpen(false)}
            >
              <X className="size-4" />
              {t('close')}
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="border-border rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-navy font-bold">#{revision.revision}</p>
                  <span className="bg-muted rounded-full px-2 py-1 text-[10px] font-bold uppercase">
                    {revision.kind}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {new Date(revision.created_at).toLocaleString()}
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  disabled={
                    busy || revision.revision === selected.draft_revision
                  }
                  onClick={() => void rollback(revision.id)}
                >
                  {t('restoreRevision')}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="border-border bg-muted flex w-fit rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setLocale('id')}
          className={`min-h-10 rounded-lg px-4 text-sm font-bold ${locale === 'id' ? 'bg-card text-navy shadow-sm' : 'text-muted-foreground'}`}
        >
          {t('languageIndonesian')}
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`min-h-10 rounded-lg px-4 text-sm font-bold ${locale === 'en' ? 'bg-card text-navy shadow-sm' : 'text-muted-foreground'}`}
        >
          {t('languageEnglish')}
        </button>
      </div>

      <section className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('thSlug')}</span>
          <input
            className={adminFieldClassName}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('audience')}</span>
          <select
            className={adminFieldClassName}
            value={document.audience}
            onChange={(event) =>
              mutate((draft) => {
                draft.audience = event.target
                  .value as AdminEducationDocument['audience'];
              })
            }
          >
            <option value="student">{t('audienceStudent')}</option>
            <option value="partner">{t('audiencePartner')}</option>
            <option value="all">{t('audienceAll')}</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">
            {t('experienceType')}
          </span>
          <select
            className={adminFieldClassName}
            value={document.experience_type}
            onChange={(event) =>
              mutate((draft) => {
                draft.experience_type = event.target
                  .value as AdminEducationDocument['experience_type'];
                if (draft.experience_type === 'partner_response_simulator') {
                  draft.audience = 'partner';
                }
              })
            }
          >
            <option value="article">{t('experienceArticle')}</option>
            <option value="partner_response_simulator">
              {t('experienceSimulator')}
            </option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('category')}</span>
          <select
            className={adminFieldClassName}
            value={document.category}
            onChange={(event) =>
              mutate((draft) => {
                draft.category = event.target.value;
              })
            }
          >
            {!educationCategoryCodes.includes(
              document.category as (typeof educationCategoryCodes)[number]
            ) ? (
              <option value={document.category}>
                {tDynamic(
                  dynamicLabelKey('educationCategory', document.category),
                  { value: dynamicLabelFallback(document.category) }
                )}
              </option>
            ) : null}
            {educationCategoryCodes.map((category) => (
              <option key={category} value={category}>
                {tDynamic(dynamicLabelKey('educationCategory', category), {
                  value: dynamicLabelFallback(category),
                })}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">
            {t('moduleTitle')}
          </span>
          <input
            className={adminFieldClassName}
            value={translation.title}
            onChange={(event) =>
              mutate((draft) => {
                draft.translations[locale].title = event.target.value;
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('thDuration')}</span>
          <input
            type="number"
            min={1}
            max={120}
            className={adminFieldClassName}
            value={document.estimated_minutes}
            onChange={(event) =>
              mutate((draft) => {
                draft.estimated_minutes = Number(event.target.value);
              })
            }
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-navy text-xs font-bold">
            {t('moduleSummary')}
          </span>
          <textarea
            className={`${adminFieldClassName} min-h-24 py-3`}
            value={translation.summary}
            onChange={(event) =>
              mutate((draft) => {
                draft.translations[locale].summary = event.target.value;
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">
            {t('learningObjective')}
          </span>
          <textarea
            className={`${adminFieldClassName} min-h-24 py-3`}
            value={translation.learning_objective}
            onChange={(event) =>
              mutate((draft) => {
                draft.translations[locale].learning_objective =
                  event.target.value;
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('disclaimer')}</span>
          <textarea
            className={`${adminFieldClassName} min-h-24 py-3`}
            value={translation.disclaimer}
            onChange={(event) =>
              mutate((draft) => {
                draft.translations[locale].disclaimer = event.target.value;
              })
            }
          />
        </label>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-navy font-extrabold">{t('thumbnails')}</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('thumbnailsHelp')}
            </p>
          </div>
          <ThumbnailCropper busy={busy} onCrop={uploadThumb} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {document.thumbnails.map((thumb, index) => (
            <div
              key={thumb.media_id}
              className="border-border overflow-hidden rounded-2xl border"
            >
              <img
                src={`${config.apiUrl}/v1/admin/content/media/${thumb.media_id}`}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <input
                  className={adminFieldClassName}
                  placeholder={
                    locale === 'id' ? t('altIndonesian') : t('altEnglish')
                  }
                  value={thumb.alt_text[locale]}
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.thumbnails[index].alt_text[locale] =
                        event.target.value;
                    })
                  }
                />
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() =>
                      mutate((draft) => {
                        [draft.thumbnails[index - 1], draft.thumbnails[index]] =
                          [
                            draft.thumbnails[index],
                            draft.thumbnails[index - 1],
                          ];
                        draft.thumbnails.forEach((item, order) => {
                          item.sort_order = order;
                        });
                      })
                    }
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === document.thumbnails.length - 1}
                    onClick={() =>
                      mutate((draft) => {
                        [draft.thumbnails[index + 1], draft.thumbnails[index]] =
                          [
                            draft.thumbnails[index],
                            draft.thumbnails[index + 1],
                          ];
                        draft.thumbnails.forEach((item, order) => {
                          item.sort_order = order;
                        });
                      })
                    }
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      mutate((draft) => {
                        draft.thumbnails.splice(index, 1);
                      })
                    }
                  >
                    <Trash2 className="size-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {document.sections.map((section, sectionIndex) => {
          const localized = section.translations[locale];
          return (
            <section
              key={section.id}
              className="border-border bg-card rounded-2xl border p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-navy font-extrabold">
                  {t('section')} {sectionIndex + 1}
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={document.sections.length === 1}
                  onClick={() =>
                    mutate((draft) => {
                      draft.sections.splice(sectionIndex, 1);
                      draft.sections.forEach((item, order) => {
                        item.sort_order = order;
                      });
                    })
                  }
                >
                  <Trash2 className="size-4 text-rose-600" />
                  {t('remove')}
                </Button>
              </div>
              <label className="mt-4 block space-y-2">
                <span className="text-navy text-xs font-bold">
                  {t('sectionTitle')}
                </span>
                <input
                  className={adminFieldClassName}
                  value={localized.title}
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.sections[sectionIndex].translations[locale].title =
                        event.target.value;
                    })
                  }
                />
              </label>
              <div className="mt-4">
                <RichTextEditor
                  value={localized.content}
                  onChange={(content) =>
                    mutate((draft) => {
                      draft.sections[sectionIndex].translations[
                        locale
                      ].content = content;
                    })
                  }
                  onRequestMedia={requestContentMedia}
                />
              </div>
              <div className="mt-5 rounded-2xl bg-blue-50 p-4">
                <h4 className="text-navy text-sm font-extrabold">
                  {t('knowledgeCheck')}
                </h4>
                <input
                  className={`${adminFieldClassName} mt-3`}
                  placeholder={t('question')}
                  value={localized.knowledge_check.question}
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.sections[sectionIndex].translations[
                        locale
                      ].knowledge_check.question = event.target.value;
                    })
                  }
                />
                {localized.knowledge_check.choices.map(
                  (choice, choiceIndex) => (
                    <label
                      key={choice.id}
                      className="mt-2 flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name={`${section.id}-${locale}`}
                        checked={
                          localized.knowledge_check.correct_choice_id ===
                          choice.id
                        }
                        onChange={() =>
                          mutate((draft) => {
                            draft.sections[sectionIndex].translations[
                              locale
                            ].knowledge_check.correct_choice_id = choice.id;
                          })
                        }
                      />
                      <input
                        className={adminFieldClassName}
                        placeholder={`${t('answer')} ${choiceIndex + 1}`}
                        value={choice.text}
                        onChange={(event) =>
                          mutate((draft) => {
                            draft.sections[sectionIndex].translations[
                              locale
                            ].knowledge_check.choices[choiceIndex].text =
                              event.target.value;
                          })
                        }
                      />
                    </label>
                  )
                )}
                <textarea
                  className={`${adminFieldClassName} mt-2 min-h-20 py-3`}
                  placeholder={t('explanation')}
                  value={localized.knowledge_check.explanation}
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.sections[sectionIndex].translations[
                        locale
                      ].knowledge_check.explanation = event.target.value;
                    })
                  }
                />
              </div>
            </section>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            mutate((draft) => {
              draft.sections.push(makeSection(draft.sections.length));
            })
          }
        >
          <Plus className="size-4" />
          {t('addSection')}
        </Button>
      </div>

      <section className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">
            {t('reviewerName')}
          </span>
          <input
            className={adminFieldClassName}
            value={document.reviewer_name}
            onChange={(event) =>
              mutate((draft) => {
                draft.reviewer_name = event.target.value;
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">
            {t('reviewerRole')}
          </span>
          <input
            className={adminFieldClassName}
            value={translation.reviewer_role}
            onChange={(event) =>
              mutate((draft) => {
                draft.translations[locale].reviewer_role = event.target.value;
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-navy text-xs font-bold">{t('reviewedAt')}</span>
          <input
            type="date"
            className={adminFieldClassName}
            value={document.reviewed_at}
            onChange={(event) =>
              mutate((draft) => {
                draft.reviewed_at = event.target.value;
              })
            }
          />
        </label>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-navy font-extrabold">{t('sources')}</h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              mutate((draft) => {
                draft.sources.push({
                  title: '',
                  publisher: '',
                  url: 'https://',
                  accessed_at: new Date().toISOString(),
                });
              })
            }
          >
            <Plus className="size-4" />
            {t('addSource')}
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {document.sources.map((source, index) => (
            <div
              key={index}
              className="bg-muted/60 grid gap-2 rounded-xl p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]"
            >
              <input
                className={adminFieldClassName}
                placeholder={t('sourceTitle')}
                value={source.title}
                onChange={(event) =>
                  mutate((draft) => {
                    draft.sources[index].title = event.target.value;
                  })
                }
              />
              <input
                className={adminFieldClassName}
                placeholder={t('publisher')}
                value={source.publisher}
                onChange={(event) =>
                  mutate((draft) => {
                    draft.sources[index].publisher = event.target.value;
                  })
                }
              />
              <label className="relative">
                <ExternalLink className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  className={`${adminFieldClassName} pl-10`}
                  type="url"
                  value={source.url}
                  onChange={(event) =>
                    mutate((draft) => {
                      draft.sources[index].url = event.target.value;
                    })
                  }
                />
              </label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={document.sources.length === 1}
                onClick={() =>
                  mutate((draft) => {
                    draft.sources.splice(index, 1);
                  })
                }
              >
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
