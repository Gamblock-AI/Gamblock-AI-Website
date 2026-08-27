'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  History,
  ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
  X,
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
import { Pagination } from '@/components/dashboard/pagination';
import {
  FilterResetButton,
  FilterSearchInput,
  FilterToggleButton,
} from '@/components/dashboard/filter-toolbar';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { useQueryFilters } from '@/hooks/use-query-filters';
import { ThumbnailPlaceholder } from '@/components/education/thumbnail-placeholder';
import type {
  AdminEducationDocument,
  AdminEducationMedia,
  AdminEducationModule,
  AdminEducationRevision,
  AdminModuleDraft,
} from '@/hooks/use-admin-operations';
import type { RichTextDocument } from '@/hooks/use-education';
import type { EditorMediaSelection } from '@/components/education/rich-text-editor';
import { RichTextEditor } from '@/components/education/rich-text-editor';
import { ThumbnailCropper } from '@/components/education/thumbnail-cropper';
import { resolveEducationMediaURL } from '@/components/education/media-url';
import { apiClientBlob } from '@/lib/api-client';
import { toastError, toastSuccess, toastValidationError } from '@/lib/feedback';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
  educationCategoryCodes,
} from '@/lib/i18n/dynamic-labels';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/routes';
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

const emptyRichText = (): RichTextDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

function collectRichTextStrings(doc: unknown): string[] {
  const result: string[] = [];
  function traverse(node: unknown) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) traverse(child);
      return;
    }
    const obj = node as Record<string, unknown>;
    if (typeof obj.text === 'string') {
      result.push(obj.text);
    }
    if (Array.isArray(obj.content)) {
      for (const child of obj.content) traverse(child);
    }
  }
  traverse(doc);
  return result;
}

function cloneAndTranslateRichText(
  sourceDoc: unknown,
  nextText: () => string
): RichTextDocument {
  if (!sourceDoc || typeof sourceDoc !== 'object') {
    return emptyRichText();
  }
  function transform(node: unknown): unknown {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
      return node.map(transform);
    }
    const obj = { ...(node as Record<string, unknown>) };
    if (typeof obj.text === 'string') {
      obj.text = nextText();
    }
    if (Array.isArray(obj.content)) {
      obj.content = obj.content.map(transform) as RichTextDocument[];
    }
    return obj;
  }
  return transform(sourceDoc) as RichTextDocument;
}

function collectDocTexts(doc: AdminEducationDocument, localeKey: string): string[] {
  const texts: string[] = [];
  // Coerce missing fields to empty strings so the collected array always stays
  // positionally aligned with applyDocTranslations and never feeds undefined
  // entries into the translation button.
  const push = (value: unknown) => {
    texts.push(typeof value === 'string' ? value : '');
  };
  const tr = doc.translations[localeKey as 'id' | 'en'];
  if (tr) {
    push(tr.title);
    push(tr.summary);
    push(tr.learning_objective);
    push(tr.disclaimer);
    push(tr.reviewer_role);
    for (const section of doc.sections) {
      const sTr = section.translations[localeKey as 'id' | 'en'];
      if (sTr) {
        push(sTr.title);
        const richStrings = collectRichTextStrings(sTr.content);
        for (const str of richStrings) {
          push(str);
        }
        if (sTr.knowledge_check) {
          push(sTr.knowledge_check.question);
          push(sTr.knowledge_check.explanation);
          for (const choice of sTr.knowledge_check.choices) {
            push(choice.text);
          }
        }
      }
    }
    for (const thumb of doc.thumbnails) {
      if (thumb.alt_text?.[localeKey]) {
        push(thumb.alt_text[localeKey]);
      }
    }
    for (const video of doc.videos ?? []) {
      push(video.title?.[localeKey]);
      push(video.alt_text?.[localeKey]);
    }
  }
  return texts;
}

function applyDocTranslations(
  doc: AdminEducationDocument,
  targetKey: string,
  translations: string[]
): void {
  let idx = 0;
  const next = (): string => translations[idx++] ?? '';
  const tr = doc.translations[targetKey as 'id' | 'en'];
  if (!tr) return;
  tr.title = next();
  tr.summary = next();
  tr.learning_objective = next();
  tr.disclaimer = next();
  tr.reviewer_role = next();
  const sourceKey = targetKey === 'en' ? 'id' : 'en';
  for (const section of doc.sections) {
    const sTr = section.translations[targetKey as 'id' | 'en'];
    const sourceSTr = section.translations[sourceKey as 'id' | 'en'];
    if (!sTr) continue;
    sTr.title = next();
    if (sourceSTr?.content) {
      sTr.content = cloneAndTranslateRichText(sourceSTr.content, next);
    }
    if (sTr.knowledge_check) {
      sTr.knowledge_check.question = next();
      sTr.knowledge_check.explanation = next();
      for (const choice of sTr.knowledge_check.choices) {
        choice.text = next();
      }
    }
  }
  for (const thumb of doc.thumbnails) {
    if (!thumb.alt_text) thumb.alt_text = {};
    thumb.alt_text[targetKey] = next();
  }
  for (const video of doc.videos ?? []) {
    if (!video.title) video.title = {};
    video.title[targetKey] = next();
    if (!video.alt_text) video.alt_text = {};
    video.alt_text[targetKey] = next();
  }
}

function AdminMediaImage({
  mediaId,
  alt,
  className,
}: {
  mediaId: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    apiClientBlob(`/admin/content/media/${mediaId}`)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!active) return;
        setSrc(resolveEducationMediaURL(`/v1/education/media/${mediaId}`));
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
  }, [mediaId]);

  if (loading && !src) {
    return (
      <div
        className={`bg-azure/45 flex items-center justify-center ${className ?? ''}`}
      >
        <ImageIcon className="size-6 text-navy/40 animate-pulse" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || resolveEducationMediaURL(`/v1/education/media/${mediaId}`)}
      alt={alt}
      className={className}
    />
  );
}
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
export const makeDocument = (idTitle = '', enTitle = ''): AdminEducationDocument => ({
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
  videos: [],
  sources: [
    {
      title: '',
      publisher: '',
      url: 'https://',
      accessed_at: new Date().toISOString(),
    },
  ],
});

function normalizeEducationDocument(
  document?: AdminEducationDocument | null
): AdminEducationDocument {
  const defaultDoc = makeDocument();
  if (!document || typeof document !== 'object') {
    return defaultDoc;
  }
  const raw = structuredClone(document);

  const audience = raw.audience || defaultDoc.audience;
  const experience_type = raw.experience_type || defaultDoc.experience_type;
  const category = raw.category || defaultDoc.category;
  const estimated_minutes =
    typeof raw.estimated_minutes === 'number' && raw.estimated_minutes > 0
      ? raw.estimated_minutes
      : defaultDoc.estimated_minutes;
  const reviewer_name = raw.reviewer_name || '';
  const reviewer_role = raw.reviewer_role || '';
  const reviewed_at = raw.reviewed_at || defaultDoc.reviewed_at;

  const rawTranslations = raw.translations || {};
  const translations: AdminEducationDocument['translations'] = {
    id: {
      title: rawTranslations.id?.title || '',
      summary: rawTranslations.id?.summary || '',
      learning_objective: rawTranslations.id?.learning_objective || '',
      disclaimer: rawTranslations.id?.disclaimer || '',
      reviewer_role:
        rawTranslations.id?.reviewer_role || raw.reviewer_role || '',
    },
    en: {
      title: rawTranslations.en?.title || '',
      summary: rawTranslations.en?.summary || '',
      learning_objective: rawTranslations.en?.learning_objective || '',
      disclaimer: rawTranslations.en?.disclaimer || '',
      reviewer_role:
        rawTranslations.en?.reviewer_role || raw.reviewer_role || '',
    },
  };

  const thumbnails = Array.isArray(raw.thumbnails)
    ? raw.thumbnails.filter(Boolean)
    : [];
  const videos = Array.isArray(raw.videos) ? raw.videos.filter(Boolean) : [];
  const sources =
    Array.isArray(raw.sources) && raw.sources.length > 0
      ? raw.sources.filter(Boolean).map((s) => ({
          title: s?.title || '',
          publisher: s?.publisher || '',
          url: s?.url || 'https://',
          accessed_at: s?.accessed_at || new Date().toISOString(),
        }))
      : defaultDoc.sources;

  const rawSections = Array.isArray(raw.sections)
    ? raw.sections.filter(Boolean)
    : [];
  const sections: AdminEducationDocument['sections'] =
    rawSections.length > 0
      ? rawSections.map((sec, index) => {
          const sectionID = sec?.id || `section-${index + 1}`;
          const sort_order =
            typeof sec?.sort_order === 'number' ? sec.sort_order : index;
          const required = sec?.required ?? true;

          const secTrans = sec?.translations || {};
          const idSecTrans = secTrans.id || {};
          const enSecTrans = secTrans.en || {};

          const normalizeCheck = (
            rawCheck: unknown,
            fallbackCheckID: string
          ) => {
            if (!rawCheck || typeof rawCheck !== 'object') {
              return makeCheck(fallbackCheckID);
            }
            const checkObj = rawCheck as Record<string, unknown>;
            const rawChoices = Array.isArray(checkObj.choices)
              ? checkObj.choices.filter(
                  (c: unknown): c is Record<string, unknown> =>
                    Boolean(c) && typeof c === 'object'
                )
              : [];
            const choices =
              rawChoices.length > 0
                ? rawChoices.map((c, cIdx) => ({
                    id:
                      typeof c.id === 'string' && c.id
                        ? c.id
                        : String.fromCharCode(97 + cIdx),
                    text: typeof c.text === 'string' ? c.text : '',
                  }))
                : [
                    { id: 'a', text: '' },
                    { id: 'b', text: '' },
                  ];
            return {
              id: (typeof checkObj.id === 'string' && checkObj.id) || fallbackCheckID,
              question:
                typeof checkObj.question === 'string' ? checkObj.question : '',
              choices,
              correct_choice_id:
                (typeof checkObj.correct_choice_id === 'string' &&
                  checkObj.correct_choice_id) ||
                choices[0]?.id ||
                'a',
              explanation:
                typeof checkObj.explanation === 'string'
                  ? checkObj.explanation
                  : '',
              required: typeof checkObj.required === 'boolean' ? checkObj.required : true,
            };
          };

          const checkID = `check-${sectionID}`;
          const idCheck = normalizeCheck(idSecTrans.knowledge_check, checkID);
          const enCheck = normalizeCheck(
            enSecTrans.knowledge_check,
            idCheck.id
          );

          // Keep check IDs and correct choices aligned
          enCheck.id = idCheck.id;
          if (
            idCheck.correct_choice_id &&
            !enCheck.choices.some((c) => c?.id === idCheck.correct_choice_id)
          ) {
            enCheck.correct_choice_id = idCheck.correct_choice_id;
          }

          return {
            id: sectionID,
            sort_order,
            required,
            translations: {
              id: {
                title: idSecTrans.title || '',
                content: idSecTrans.content || emptyRichText(),
                knowledge_check: idCheck,
              },
              en: {
                title: enSecTrans.title || '',
                content: enSecTrans.content || emptyRichText(),
                knowledge_check: enCheck,
              },
            },
          };
        })
      : [makeSection(0)];

  return {
    audience,
    experience_type,
    category,
    estimated_minutes,
    reviewer_name,
    reviewer_role,
    reviewed_at,
    translations,
    thumbnails,
    videos,
    sources,
    sections,
  };
}

interface DraftValidationError {
  message: string;
  fieldId: string;
  locale?: 'id' | 'en';
}

function hasRichTextContent(doc: unknown): boolean {
  if (!doc) return false;
  if (typeof doc === 'string') return doc.trim().length > 0;
  if (Array.isArray(doc)) return doc.some(hasRichTextContent);
  if (typeof doc === 'object') {
    const obj = doc as Record<string, unknown>;
    if (obj.text && typeof obj.text === 'string' && obj.text.trim().length > 0)
      return true;
    if (obj.content && Array.isArray(obj.content))
      return obj.content.some(hasRichTextContent);
  }
  return false;
}

type FieldErrors = Record<string, DraftValidationError>;

function validateAllEducationDraft(
  _slug: string,
  doc: AdminEducationDocument
): FieldErrors {
  const errors: FieldErrors = {};

  if (!doc.translations.id.title.trim()) {
    errors['title_id'] = {
      message: 'Judul modul bahasa Indonesia wajib diisi.',
      fieldId: 'field-title',
      locale: 'id',
    };
  }
  if (!doc.translations.en.title.trim()) {
    errors['title_en'] = {
      message: 'Judul modul bahasa Inggris wajib diisi.',
      fieldId: 'field-title',
      locale: 'en',
    };
  }

  if (!doc.translations.id.summary.trim()) {
    errors['summary_id'] = {
      message: 'Ringkasan modul bahasa Indonesia wajib diisi.',
      fieldId: 'field-summary',
      locale: 'id',
    };
  }
  if (!doc.translations.en.summary.trim()) {
    errors['summary_en'] = {
      message: 'Ringkasan modul bahasa Inggris wajib diisi.',
      fieldId: 'field-summary',
      locale: 'en',
    };
  }

  if (!doc.translations.id.learning_objective.trim()) {
    errors['learning_objective_id'] = {
      message: 'Tujuan pembelajaran bahasa Indonesia wajib diisi.',
      fieldId: 'field-learning-objective',
      locale: 'id',
    };
  }
  if (!doc.translations.en.learning_objective.trim()) {
    errors['learning_objective_en'] = {
      message: 'Tujuan pembelajaran bahasa Inggris wajib diisi.',
      fieldId: 'field-learning-objective',
      locale: 'en',
    };
  }

  if (!doc.translations.id.disclaimer.trim()) {
    errors['disclaimer_id'] = {
      message: 'Catatan keselamatan (disclaimer) bahasa Indonesia wajib diisi.',
      fieldId: 'field-disclaimer',
      locale: 'id',
    };
  }
  if (!doc.translations.en.disclaimer.trim()) {
    errors['disclaimer_en'] = {
      message: 'Catatan keselamatan (disclaimer) bahasa Inggris wajib diisi.',
      fieldId: 'field-disclaimer',
      locale: 'en',
    };
  }

  if (doc.thumbnails.length === 0) {
    errors['thumbnails'] = {
      message: 'Minimal 1 gambar thumbnail modul wajib diunggah.',
      fieldId: 'field-thumbnails',
    };
  }
  for (let i = 0; i < doc.thumbnails.length; i++) {
    const thumb = doc.thumbnails[i];
    if (!thumb.alt_text?.id?.trim()) {
      errors[`thumbnail_alt_${i}_id`] = {
        message: `Teks alternatif thumbnail #${i + 1} (bahasa Indonesia) wajib diisi.`,
        fieldId: `field-thumbnail-alt-${i}`,
        locale: 'id',
      };
    }
    if (!thumb.alt_text?.en?.trim()) {
      errors[`thumbnail_alt_${i}_en`] = {
        message: `Teks alternatif thumbnail #${i + 1} (bahasa Inggris) wajib diisi.`,
        fieldId: `field-thumbnail-alt-${i}`,
        locale: 'en',
      };
    }
  }

  for (let i = 0; i < (doc.videos || []).length; i++) {
    const video = doc.videos[i];
    if (!video.media_id) {
      errors[`video_${i}`] = {
        message: `Media video #${i + 1} belum valid.`,
        fieldId: 'field-videos',
      };
    }
    if (!video.alt_text?.id?.trim()) {
      errors[`video_alt_${i}_id`] = {
        message: `Teks alternatif video #${i + 1} (bahasa Indonesia) wajib diisi.`,
        fieldId: 'field-videos',
        locale: 'id',
      };
    }
    if (!video.alt_text?.en?.trim()) {
      errors[`video_alt_${i}_en`] = {
        message: `Teks alternatif video #${i + 1} (bahasa Inggris) wajib diisi.`,
        fieldId: 'field-videos',
        locale: 'en',
      };
    }
  }

  if (doc.sections.length === 0) {
    errors['sections'] = {
      message: 'Minimal 1 bagian materi wajib dibuat.',
      fieldId: 'field-sections',
    };
  }
  for (let i = 0; i < doc.sections.length; i++) {
    const section = doc.sections[i];
    for (const loc of ['id', 'en'] as const) {
      const locLabel = loc === 'id' ? 'bahasa Indonesia' : 'bahasa Inggris';
      const tr = section.translations[loc];
      if (!tr?.title?.trim()) {
        errors[`section_${i}_title_${loc}`] = {
          message: `Judul Bagian ${i + 1} (${locLabel}) wajib diisi.`,
          fieldId: `field-section-${i}-title`,
          locale: loc,
        };
      }
      if (!hasRichTextContent(tr.content)) {
        errors[`section_${i}_content_${loc}`] = {
          message: `Isi materi Bagian ${i + 1} (${locLabel}) wajib diisi.`,
          fieldId: `field-section-${i}-content`,
          locale: loc,
        };
      }
      const kc = tr.knowledge_check;
      if (!kc?.question?.trim()) {
        errors[`section_${i}_kc_question_${loc}`] = {
          message: `Pertanyaan kuis Bagian ${i + 1} (${locLabel}) wajib diisi.`,
          fieldId: `field-section-${i}-kc-question`,
          locale: loc,
        };
      }
      if (!kc.choices || kc.choices.length < 2) {
        errors[`section_${i}_kc_choices_${loc}`] = {
          message: `Kuis Bagian ${i + 1} (${locLabel}) membutuhkan minimal 2 pilihan jawaban.`,
          fieldId: `field-section-${i}-kc-choices`,
          locale: loc,
        };
      } else {
        for (let c = 0; c < kc.choices.length; c++) {
          if (!kc.choices[c].text.trim()) {
            errors[`section_${i}_kc_choice_${c}_${loc}`] = {
              message: `Pilihan jawaban ${c + 1} (${locLabel}) wajib diisi.`,
              fieldId: `field-section-${i}-kc-choice-${c}`,
              locale: loc,
            };
          }
        }
        if (
          !kc.correct_choice_id ||
          !kc.choices.some((c) => c.id === kc.correct_choice_id)
        ) {
          errors[`section_${i}_kc_correct_${loc}`] = {
            message: `Kunci jawaban benar (${locLabel}) belum dipilih.`,
            fieldId: `field-section-${i}-kc-choices`,
            locale: loc,
          };
        }
      }
      if (!kc.explanation?.trim()) {
        errors[`section_${i}_kc_explanation_${loc}`] = {
          message: `Penjelasan jawaban kuis Bagian ${i + 1} (${locLabel}) wajib diisi.`,
          fieldId: `field-section-${i}-kc-explanation`,
          locale: loc,
        };
      }
    }
  }

  if (!doc.reviewer_name?.trim()) {
    errors['reviewer_name'] = {
      message: 'Nama reviewer wajib diisi.',
      fieldId: 'field-reviewer-name',
    };
  }
  if (!doc.translations.id.reviewer_role?.trim() && !doc.reviewer_role?.trim()) {
    errors['reviewer_role_id'] = {
      message: 'Peran reviewer (bahasa Indonesia) wajib diisi.',
      fieldId: 'field-reviewer-role',
      locale: 'id',
    };
  }
  if (!doc.translations.en.reviewer_role?.trim() && !doc.reviewer_role?.trim()) {
    errors['reviewer_role_en'] = {
      message: 'Peran reviewer (bahasa Inggris) wajib diisi.',
      fieldId: 'field-reviewer-role',
      locale: 'en',
    };
  }
  if (!doc.reviewed_at?.trim()) {
    errors['reviewed_at'] = {
      message: 'Tanggal tinjauan reviewer wajib diisi.',
      fieldId: 'field-reviewed-at',
    };
  }

  if (doc.sources.length === 0) {
    errors['sources'] = {
      message: 'Minimal 1 sumber rujukan wajib ditambahkan.',
      fieldId: 'field-sources',
    };
  }
  for (let i = 0; i < doc.sources.length; i++) {
    const source = doc.sources[i];
    if (!source.title?.trim()) {
      errors[`source_${i}_title`] = {
        message: `Judul sumber rujukan #${i + 1} wajib diisi.`,
        fieldId: `field-source-title-${i}`,
      };
    }
    if (!source.url?.trim() || !source.url.startsWith('https://')) {
      errors[`source_${i}_url`] = {
        message: `URL sumber rujukan #${i + 1} harus menggunakan protokol HTTPS yang valid.`,
        fieldId: `field-source-url-${i}`,
      };
    }
  }

  return errors;
}

interface ContentTabProps {
  modules: AdminEducationModule[];
  moduleID?: string;
  createModule: (module: AdminModuleDraft) => Promise<AdminEducationModule>;
  getModule: (id: string) => Promise<AdminEducationModule>;
  saveModule: (
    module: AdminEducationModule,
    slug: string,
    document: AdminEducationDocument
  ) => Promise<AdminEducationModule>;
  transitionModule: (
    id: string,
    action: 'submit-review' | 'publish'
  ) => Promise<AdminEducationModule>;
  deleteModule: (id: string) => Promise<unknown>;
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

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ContentTab(props: ContentTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const tPagination = useTranslations('pagination');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getModule, moduleID } = props;
  const langParam = searchParams.get('lang');
  const locale: 'id' | 'en' = langParam === 'en' ? 'en' : 'id';
  const isNew = moduleID === 'new';
  const [prevModuleID, setPrevModuleID] = useState(moduleID);
  const [isCreating, setIsCreating] = useState(isNew);
  const [selected, setSelected] = useState<AdminEducationModule | null>(null);
  const [slug, setSlug] = useState('');
  const [document, setDocument] = useState<AdminEducationDocument | null>(() => {
    if (isNew) {
      return makeDocument('', '');
    }
    return null;
  });
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [revisions, setRevisions] = useState<AdminEducationRevision[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] =
    useState<AdminEducationRevision | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] =
    useState<AdminEducationModule | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const deletedModuleIdRef = useRef<string | null>(null);

  const {
    getFilter,
    setFilter: setCatalogFilter,
    clearFilters: clearCatalogFilters,
    isExpanded: showCatalogFilters,
    toggleExpanded: toggleCatalogFilters,
    activeFilterCount: activeCatalogFilterCount,
    hasActiveFilters: hasActiveCatalogFilters,
  } = useQueryFilters({
    filterKeys: ['status', 'q'],
    defaultValues: { status: 'all' },
    ignoredKeys: ['lang', 'moduleID'],
    pageKey: 'page[content]',
  });

  const catalogStatus = getFilter('status', 'all');
  const catalogQuery = getFilter('q', '');

  const modulesQuery = usePaginatedQuery<AdminEducationModule>({
    path: `/admin/content/modules?${new URLSearchParams({
      ...(catalogStatus !== 'all' ? { status: catalogStatus } : {}),
      ...(catalogQuery ? { q: catalogQuery } : {}),
    }).toString()}`,
    pageKey: 'page[content]',
    pageSize: 6,
  });
  const pagedModules = modulesQuery.items;
  const pagination = modulesQuery.pagination;

  if (moduleID !== prevModuleID) {
    setPrevModuleID(moduleID);
    if (moduleID === 'new') {
      setIsCreating(true);
      setSelected(null);
      setSlug('');
      setDocument(makeDocument('', ''));
      setFieldErrors({});
    } else if (!moduleID) {
      setIsCreating(false);
      setSelected(null);
      setSlug('');
      setDocument(null);
      setFieldErrors({});
    }
  }

  const startCreate = () => {
    setIsCreating(true);
    setSelected(null);
    setSlug('');
    setDocument(makeDocument('', ''));
    setFieldErrors({});
    router.push(`${ROUTES.ADMIN_CONTENT_NEW}?lang=id`);
  };

  const clearFieldError = (...keys: string[]) => {
    setFieldErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const key of keys) {
        if (next[key]) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  };

  useEffect(() => {
    if (moduleID && langParam !== 'id' && langParam !== 'en') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lang', 'id');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [langParam, moduleID, pathname, router, searchParams]);

  const setLocale = (newLocale: 'id' | 'en') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', newLocale);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!selected && !isCreating) return;

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
  }, [selected, isCreating]);

  useEffect(() => {
    if (
      !moduleID ||
      moduleID === 'new' ||
      selected?.id === moduleID ||
      selected?.slug === moduleID ||
      deletedModuleIdRef.current === moduleID
    ) {
      return;
    }
    let active = true;

    const matchedModule = (props.modules || []).find(
      (m) => Boolean(m) && (m.id === moduleID || m.slug === moduleID)
    );
    const targetID = matchedModule?.id || moduleID;

    void getModule(targetID)
      .then((educationModule) => {
        if (!active) return;
        setIsCreating(false);
        setSelected(educationModule);
        setSlug(educationModule.slug);
        setFieldErrors({});
        setDocument(normalizeEducationDocument(educationModule.draft_document));
      })
      .catch(() => {
        if (active) {
          router.replace(ROUTES.ADMIN_CONTENT);
        }
      });

    return () => {
      active = false;
    };
  }, [getModule, moduleID, props.modules, router, selected?.id, selected?.slug]);

  const mutate = (callback: (draft: AdminEducationDocument) => void) =>
    setDocument((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      callback(next);
      return next;
    });

  const save = async () => {
    if (!document) return;
    const finalSlug =
      slug.trim() ||
      slugify(
        document.translations.id.title ||
          document.translations.en.title ||
          'modul-edukasi'
      );
    setBusy(true);
    try {
      const normalizedDoc = normalizeEducationDocument(document);
      if (isCreating) {
        const educationModule = await props.createModule({
          slug: finalSlug,
          document: normalizedDoc,
        });
        setIsCreating(false);
        setSelected(educationModule);
        setDocument(normalizeEducationDocument(educationModule.draft_document));
        setSlug(educationModule.slug);
        toastSuccess(t('moduleCreated'));
        router.replace(`${ROUTES.ADMIN_CONTENT}/${educationModule.id}?lang=${locale}`);
      } else if (selected) {
        const educationModule = await props.saveModule(
          selected,
          finalSlug,
          normalizedDoc
        );
        setSelected(educationModule);
        setDocument(normalizeEducationDocument(educationModule.draft_document));
        setSlug(educationModule.slug);
        toastSuccess(t('moduleSaved'));
      }
    } catch (error) {
      toastError(error, t('moduleSaveError'));
    } finally {
      setBusy(false);
    }
  };

  const transition = async (
    action: 'submit-review' | 'publish'
  ) => {
    if (action === 'publish' && document) {
      const errors = validateAllEducationDraft(slug, document);
      setFieldErrors(errors);
      const errorList = Object.values(errors);
      if (errorList.length > 0) {
        const targetError =
          errorList.find((e) => !e.locale || e.locale === locale) ||
          errorList[0];
        if (targetError.locale && targetError.locale !== locale) {
          setLocale(targetError.locale);
        }
        setTimeout(() => {
          const el =
            typeof window !== 'undefined'
              ? window.document.getElementById(targetError.fieldId)
              : null;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if ('focus' in el && typeof el.focus === 'function') {
              el.focus();
            }
          }
        }, 120);
        toastValidationError(
          'Terdapat isian yang belum lengkap. Silakan periksa tanda merah pada formulir.'
        );
        return;
      }
    }

    setBusy(true);
    try {
      let currentSelected = selected;
      if (isCreating && document) {
        const finalSlug =
          slug.trim() ||
          slugify(
            document.translations.id.title ||
              document.translations.en.title ||
              'modul-edukasi'
          );
        const normalizedDoc = normalizeEducationDocument(document);
        currentSelected = await props.createModule({
          slug: finalSlug,
          document: normalizedDoc,
        });
        setIsCreating(false);
        setSelected(currentSelected);
      } else if (action === 'publish' && document && selected) {
        const normalizedDoc = normalizeEducationDocument(document);
        const finalSlug =
          slug.trim() ||
          slugify(
            document.translations.id.title ||
              document.translations.en.title ||
              'modul-edukasi'
          );
        currentSelected = await props.saveModule(
          selected,
          finalSlug,
          normalizedDoc
        );
        setSelected(currentSelected);
      }
      if (!currentSelected) return;
      const educationModule = await props.transitionModule(
        currentSelected.id,
        action
      );
      setSelected(educationModule);
      setDocument(normalizeEducationDocument(educationModule.draft_document));
      setSlug(educationModule.slug);
      if (isCreating) {
        router.replace(`${ROUTES.ADMIN_CONTENT}/${educationModule.id}?lang=${locale}`);
      }
      toastSuccess(
        action === 'publish'
          ? t('modulePublished')
          : t('moduleSubmitted')
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
      setRollbackTarget(null);
      setRollbackReason('');
      setHistoryOpen(true);
    } catch (error) {
      toastError(error, t('fetchError'));
    } finally {
      setBusy(false);
    }
  };
  const handleConfirmRollback = async () => {
    if (!selected || !rollbackTarget) return;
    const reason = rollbackReason.trim();
    if (!reason) return;
    setBusy(true);
    try {
      const updated = await props.rollbackModule(
        selected.id,
        rollbackTarget.id,
        reason
      );
      setSelected(updated);
      setSlug(updated.slug);
      setDocument(normalizeEducationDocument(updated.draft_document));
      setHistoryOpen(false);
      setRollbackTarget(null);
      setRollbackReason('');
      toastSuccess(t('rollbackSuccess'));
    } catch (error) {
      toastError(error, t('rollbackError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (targetModule?: AdminEducationModule) => {
    const target = targetModule || selected;
    if (!target) return;
    setModuleToDelete(target);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;
    const deletedId = moduleToDelete.id;
    deletedModuleIdRef.current = deletedId;
    setBusy(true);
    try {
      await props.deleteModule(deletedId);
      toastSuccess(t('moduleDeleted'));
      setDeleteConfirmOpen(false);
      setModuleToDelete(null);
      if (
        selected?.id === deletedId ||
        selected?.slug === moduleID ||
        moduleID === deletedId
      ) {
        setSelected(null);
        setDocument(null);
        setSlug('');
        setIsCreating(false);
        router.replace(ROUTES.ADMIN_CONTENT);
      }
    } catch (error) {
      toastError(error, t('fetchError'));
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

  const uploadVideo = () => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const media = await props.uploadEducationMedia(file, 'content');
        mutate((draft) => {
          if (!draft.videos) draft.videos = [];
          draft.videos.push({
            media_id: media.id,
            sort_order: draft.videos.length,
            title: { id: '', en: '' },
            alt_text: { id: '', en: '' },
          });
        });
        toastSuccess(t('mediaUploaded'));
      } catch (error) {
        toastError(error, t('mediaUploadError'));
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const addExternalVideo = async () => {
    const url = window.prompt(t('externalMediaURL'), 'https://');
    if (!url) return;
    setBusy(true);
    try {
      const media = await props.registerExternalEducationMedia(url, 'video');
      mutate((draft) => {
        if (!draft.videos) draft.videos = [];
        draft.videos.push({
          media_id: media.id,
          sort_order: draft.videos.length,
          title: { id: '', en: '' },
          alt_text: { id: '', en: '' },
        });
      });
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

  if (
    moduleID &&
    moduleID !== 'new' &&
    selected?.id !== moduleID &&
    selected?.slug !== moduleID
  )
    return (
      <div className="border-border bg-card flex min-h-72 items-center justify-center rounded-2xl border">
        <p className="text-muted-foreground text-sm">{t('loading')}</p>
      </div>
    );

  if (!isCreating && (!selected || !document))
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h3 className="text-navy text-base font-bold">Katalog Modul Edukasi</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('contentDescription')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterToggleButton
              isExpanded={showCatalogFilters}
              onToggle={toggleCatalogFilters}
              hasActiveFilters={hasActiveCatalogFilters}
              activeCount={activeCatalogFilterCount}
              label={t('filterToggle') || 'Filter'}
            />
            <Button size="sm" onClick={startCreate}>
              <Plus className="size-4" />
              {t('newModule')}
            </Button>
          </div>
        </div>

        {showCatalogFilters ? (
          <div className="border-border/80 bg-card shadow-soft flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
              <FilterSearchInput
                value={catalogQuery}
                onChangeValue={(val) => {
                  setCatalogFilter('q', val);
                }}
                placeholder="Cari judul, slug, atau ringkasan..."
                className="flex-1 max-w-sm"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
                {(['all', 'draft', 'in_review', 'published'] as const).map((status) => {
                  const isActive = catalogStatus === status;
                  const statusLabel =
                    status === 'all'
                      ? 'Semua'
                      : tDynamic(dynamicLabelKey('status', status), {
                          value: dynamicLabelFallback(status),
                        });
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setCatalogFilter('status', status);
                      }}
                      className={cn(
                        'rounded-xl px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap',
                        isActive
                          ? 'bg-navy text-white shadow-2xs'
                          : 'border border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-navy'
                      )}
                    >
                      {statusLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveCatalogFilters ? (
              <FilterResetButton
                onClick={() => {
                  clearCatalogFilters(['status', 'q']);
                }}
                label={t('clearFilters') || 'Reset'}
                className="self-end sm:self-center"
              />
            ) : null}
          </div>
        ) : null}

        {pagination.totalItems > 0 ? (
          <div className="text-muted-foreground/80 flex items-center justify-between text-xs font-semibold px-1">
            <span>
              {tPagination('showingRange', {
                start: pagination.startIndex,
                end: pagination.endIndex,
                total: pagination.totalItems,
              })}
            </span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pagedModules.length ? (
            pagedModules.map((module) => {
              const firstThumb =
                module.draft_document?.thumbnails?.[0] ||
                module.published_document?.thumbnails?.[0];

              return (
                <button
                  type="button"
                  key={module.id}
                  onClick={() => router.push(`${ROUTES.ADMIN_CONTENT}/${module.id}?lang=id`)}
                  className="group border-border/80 bg-card shadow-soft hover:shadow-md hover:border-navy/30 flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
                >
                  <div>
                    {firstThumb?.media_id ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <AdminMediaImage
                          mediaId={firstThumb.media_id}
                          alt={module.title || module.slug}
                          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <AdminStatusBadge status={module.status} />
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-video w-full overflow-hidden">
                        <ThumbnailPlaceholder
                          title={module.title || module.slug}
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <AdminStatusBadge status={module.status} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 p-5">
                      <h3 className="text-navy group-hover:text-navy-light text-base font-bold leading-snug transition-colors line-clamp-2">
                        {module.title || module.slug}
                      </h3>
                      <span className="border-border/60 bg-muted/50 text-muted-foreground inline-block max-w-full truncate rounded-md border px-2 py-0.5 font-mono text-[0.7rem]">
                        {module.slug}
                      </span>
                    </div>
                  </div>

                  <div className="border-border/60 mx-5 mb-4 border-t pt-3">
                    <span className="text-navy flex items-center gap-1.5 text-xs font-bold transition-transform duration-200 group-hover:translate-x-0.5">
                      {t('editModule')}
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </button>
              );
            })
          ) : pagination.totalItems > 0 ? (
            <div className="border-border bg-card shadow-soft col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border py-12 px-6 text-center">
              <Search className="text-muted-foreground size-8 opacity-60" />
              <div className="space-y-1">
                <p className="text-navy text-sm font-bold">Tidak ada modul yang cocok</p>
                <p className="text-muted-foreground text-xs">
                  Coba ubah kata kunci pencarian atau filter status.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearCatalogFilters(['status', 'q']);
                }}
              >
                {t('clearFilters') || 'Reset Filter'}
              </Button>
            </div>
          ) : (
            <div className="border-border bg-card shadow-soft col-span-full flex flex-col items-center justify-center gap-3.5 rounded-2xl border py-10 sm:py-14 px-6 text-center">
              <span className="bg-navy/5 text-navy flex size-12 items-center justify-center rounded-2xl ring-1 ring-navy/10">
                <BookOpen className="size-6" aria-hidden="true" />
              </span>
              <div className="space-y-1.5 max-w-md mx-auto text-center">
                <p className="text-navy text-sm font-bold text-center">{t('noModules')}</p>
                <p className="text-muted-foreground text-xs leading-relaxed text-center">
                  {t('noModulesDescription')}
                </p>
              </div>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-2">
            <span className="text-muted-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-center">
              {tPagination('showingRange', {
                start: pagination.startIndex,
                end: pagination.endIndex,
                total: pagination.totalItems,
              })}
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
              variant="flat"
              size="sm"
            />
          </div>
        ) : null}

        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-navy flex items-center gap-2">
                <Trash2 className="size-5 text-destructive" />
                {t('deleteModuleTitle')}
              </DialogTitle>
              <DialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
                {t('deleteModuleConfirm', {
                  title: moduleToDelete?.title || moduleToDelete?.slug || '',
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setModuleToDelete(null);
                }}
                disabled={busy}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleConfirmDelete()}
                disabled={busy}
              >
                {t('deleteModule')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (!document) return null;
  const translation = document.translations[locale];
  const isPublished = !isCreating && selected?.status === 'published';
  return (
    <div className="space-y-5">
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
            onClick={() => {
              setIsCreating(false);
              router.push(ROUTES.ADMIN_CONTENT);
            }}
            className="hover:bg-muted flex size-10 items-center justify-center rounded-xl"
            aria-label={t('closeEditor')}
          >
            <X className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-navy font-extrabold">
                {translation.title || slug || (isCreating ? t('newModule') : '')}
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
              {isCreating ? (
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  (belum disimpan)
                </span>
              ) : selected ? (
                t('draftRevision', { revision: selected.draft_revision })
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isCreating && selected ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void openHistory()}
            >
              <History className="size-4" />
              {t('revisionHistory')}
            </Button>
          ) : null}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void save()}
          >
            <Save className="size-4" />
            {t('saveDraft')}
          </Button>
          <Button
            disabled={busy}
            onClick={() => void transition('publish')}
          >
            {isPublished ? (
              <Save className="size-4" />
            ) : (
              <Upload className="size-4" />
            )}
            {isPublished ? t('save') : t('publish')}
          </Button>
          {!isCreating && selected ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => handleDeleteClick()}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              {t('deleteModule')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="border-border bg-muted flex w-fit rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setLocale('id')}
            className={`min-h-10 rounded-lg px-4 text-sm font-bold flex items-center gap-2 ${locale === 'id' ? 'bg-card text-navy shadow-sm' : 'text-muted-foreground'}`}
          >
            <span>{t('languageIndonesian')}</span>
            {Object.entries(fieldErrors).filter(([, v]) => !v.locale || v.locale === 'id').length > 0 ? (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">
                {Object.entries(fieldErrors).filter(([, v]) => !v.locale || v.locale === 'id').length}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`min-h-10 rounded-lg px-4 text-sm font-bold flex items-center gap-2 ${locale === 'en' ? 'bg-card text-navy shadow-sm' : 'text-muted-foreground'}`}
          >
            <span>{t('languageEnglish')}</span>
            {Object.entries(fieldErrors).filter(([, v]) => v.locale === 'en').length > 0 ? (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">
                {Object.entries(fieldErrors).filter(([, v]) => v.locale === 'en').length}
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
          sourceTexts={collectDocTexts(document, locale === 'en' ? 'id' : 'en')}
          onTranslated={(translations) => {
            mutate((doc) => {
              applyDocTranslations(doc, locale === 'en' ? 'en' : 'id', translations);
            });
          }}
        />
      </div>

      <section className="border-border bg-card grid gap-5 rounded-2xl border p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-navy text-xs font-bold">
            {t('moduleTitle')}
            <RequiredMark />
          </span>
          <input
            id="field-title"
            className={cn(
              adminFieldClassName,
              fieldErrors[`title_${locale}`] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder="Contoh: Mengenali Perangkap Desain"
            value={translation.title}
            onChange={(event) => {
              const newTitle = event.target.value;
              mutate((draft) => {
                draft.translations[locale].title = newTitle;
              });
              clearFieldError(`title_${locale}`);
              if (!slug || slug === slugify(translation.title)) {
                setSlug(slugify(newTitle));
              }
            }}
          />
          <FieldError message={fieldErrors[`title_${locale}`]?.message} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('audience')}
            <RequiredMark />
          </span>
          <select
            className={adminFieldClassName}
            value={document.audience}
            onChange={(event) =>
              mutate((draft) => {
                draft.audience = event.target.value as AdminEducationDocument['audience'];
              })
            }
          >
            <option value="student">{t('audienceStudent')}</option>
            <option value="partner">{t('audiencePartner')}</option>
            <option value="all">{t('audienceAll')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('experienceType')}
            <RequiredMark />
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
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('category')}
            <RequiredMark />
          </span>
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
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('thDuration')}
            <RequiredMark />
          </span>
          <input
            type="number"
            min={1}
            max={120}
            placeholder="8"
            className={adminFieldClassName}
            value={document.estimated_minutes}
            onChange={(event) =>
              mutate((draft) => {
                draft.estimated_minutes = Number(event.target.value);
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-navy text-xs font-bold">
            {t('moduleSummary')}
            <RequiredMark />
          </span>
          <textarea
            id="field-summary"
            className={cn(
              `${adminFieldClassName} min-h-24 py-3`,
              fieldErrors[`summary_${locale}`] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder={
              locale === 'id'
                ? 'Contoh: Modul ini mengupas bias kognitif dan ilusi kontrol yang memicu dorongan bertaruh serta langkah praktis mengatasinya.'
                : 'e.g. This module explores cognitive biases and illusions of control triggering betting urges along with practical mitigation.'
            }
            value={translation.summary}
            onChange={(event) => {
              mutate((draft) => {
                draft.translations[locale].summary = event.target.value;
              });
              clearFieldError(`summary_${locale}`);
            }}
          />
          <FieldError message={fieldErrors[`summary_${locale}`]?.message} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('learningObjective')}
            <RequiredMark />
          </span>
          <textarea
            id="field-learning-objective"
            className={cn(
              `${adminFieldClassName} min-h-24 py-3`,
              fieldErrors[`learning_objective_${locale}`] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder={
              locale === 'id'
                ? 'Contoh: Mahasiswa mampu mengenali pola pemicu dorongan dan mempraktikkan teknik jeda respons secara mandiri.'
                : 'e.g. Students will be able to recognize impulse trigger patterns and independently practice response-pause techniques.'
            }
            value={translation.learning_objective}
            onChange={(event) => {
              mutate((draft) => {
                draft.translations[locale].learning_objective =
                  event.target.value;
              });
              clearFieldError(`learning_objective_${locale}`);
            }}
          />
          <FieldError message={fieldErrors[`learning_objective_${locale}`]?.message} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('disclaimer')}
            <RequiredMark />
          </span>
          <textarea
            id="field-disclaimer"
            className={cn(
              `${adminFieldClassName} min-h-24 py-3`,
              fieldErrors[`disclaimer_${locale}`] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder={
              locale === 'id'
                ? 'Contoh: Modul ini bertujuan untuk psikoedukasi dan tidak menggantikan layanan konseling klinis profesional.'
                : 'e.g. This module is intended for psychoeducation and does not replace professional clinical counseling services.'
            }
            value={translation.disclaimer}
            onChange={(event) => {
              mutate((draft) => {
                draft.translations[locale].disclaimer = event.target.value;
              });
              clearFieldError(`disclaimer_${locale}`);
            }}
          />
          <FieldError message={fieldErrors[`disclaimer_${locale}`]?.message} />
        </label>
      </section>

      <section id="field-thumbnails" className={cn("border-border bg-card rounded-2xl border p-5", fieldErrors['thumbnails'] && "border-destructive")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-navy font-extrabold">
              {t('thumbnails')}
              <RequiredMark />
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('thumbnailsHelp')}
            </p>
            <FieldError message={fieldErrors['thumbnails']?.message} />
          </div>
          <ThumbnailCropper
            busy={busy}
            onCrop={async (file) => {
              clearFieldError('thumbnails');
              await uploadThumb(file);
            }}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {document.thumbnails.map((thumb, index) => (
            <div
              key={thumb.media_id}
              className="border-border overflow-hidden rounded-2xl border"
            >
              <AdminMediaImage
                mediaId={thumb.media_id}
                alt={thumb.alt_text[locale] || ''}
                className="aspect-video w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <input
                  id={`field-thumbnail-alt-${index}`}
                  className={cn(
                    adminFieldClassName,
                    fieldErrors[`thumbnail_alt_${index}_${locale}`] &&
                      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                  )}
                  placeholder={
                    locale === 'id'
                      ? `${t('altIndonesian')} *`
                      : `${t('altEnglish')} *`
                  }
                  value={thumb.alt_text[locale]}
                  onChange={(event) => {
                    mutate((draft) => {
                      draft.thumbnails[index].alt_text[locale] =
                        event.target.value;
                    });
                    clearFieldError(`thumbnail_alt_${index}_${locale}`);
                  }}
                />
                <FieldError message={fieldErrors[`thumbnail_alt_${index}_${locale}`]?.message} />
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
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border bg-card rounded-2xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-navy font-extrabold">
              {t('videos')}
              <OptionalMark text={t('optional')} />
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('videosHelp')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={uploadVideo}
              className="gap-1.5 rounded-xl text-xs"
            >
              <Upload className="size-3.5" />
              {t('uploadVideo')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void addExternalVideo()}
              className="gap-1.5 rounded-xl text-xs"
            >
              <ExternalLink className="size-3.5" />
              {t('addExternalVideo')}
            </Button>
          </div>
        </div>
        {(document.videos?.length ?? 0) === 0 ? (
          <div className="border-border/70 bg-muted/20 mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center">
            <div className="bg-navy/5 text-navy dark:bg-navy/20 flex size-12 items-center justify-center rounded-2xl mb-3">
              <Video className="size-6 text-muted-foreground/70" />
            </div>
            <p className="text-navy text-sm font-semibold">
              {t('noVideosYet')}
            </p>
            <p className="text-muted-foreground mt-1 max-w-md text-xs leading-relaxed">
              {t('videosHelp')}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={uploadVideo}
                className="gap-1.5 rounded-xl text-xs font-semibold"
              >
                <Upload className="size-3.5" />
                {t('uploadVideo')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void addExternalVideo()}
                className="gap-1.5 rounded-xl text-xs font-semibold"
              >
                <ExternalLink className="size-3.5" />
                {t('addExternalVideo')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(document.videos ?? []).map((video, index) => (
              <div
                key={video.media_id}
                className="border-border overflow-hidden rounded-2xl border"
              >
                <div className="bg-navy/5 flex aspect-video items-center justify-center">
                  <video
                    className="h-full w-full object-cover"
                    src={`/v1/admin/content/media/${video.media_id}`}
                    controls
                    preload="metadata"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <input
                    className={adminFieldClassName}
                    placeholder={
                      locale === 'id'
                        ? `${t('titleIndonesian')} (${t('optional')})`
                        : `${t('titleEnglish')} (${t('optional')})`
                    }
                    value={video.title?.[locale] ?? ''}
                    onChange={(event) =>
                      mutate((draft) => {
                        if (!draft.videos[index].title)
                          draft.videos[index].title = {};
                        draft.videos[index].title[locale] =
                          event.target.value;
                      })
                    }
                  />
                  <input
                    className={cn(
                      adminFieldClassName,
                      fieldErrors[`video_alt_${index}_${locale}`] &&
                        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                    )}
                    placeholder={
                      locale === 'id'
                        ? `${t('altIndonesian')} *`
                        : `${t('altEnglish')} *`
                    }
                    value={video.alt_text?.[locale] ?? ''}
                    onChange={(event) => {
                      mutate((draft) => {
                        if (!draft.videos[index].alt_text)
                          draft.videos[index].alt_text = {};
                        draft.videos[index].alt_text[locale] =
                          event.target.value;
                      });
                      clearFieldError(`video_alt_${index}_${locale}`, 'media');
                    }}
                  />
                  <FieldError
                    message={
                      fieldErrors[`video_alt_${index}_${locale}`]?.message
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
                          const v = draft.videos ?? [];
                          [v[index - 1], v[index]] = [v[index], v[index - 1]];
                          v.forEach((item, order) => {
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
                      disabled={
                        index === (document.videos?.length ?? 0) - 1
                      }
                      onClick={() =>
                        mutate((draft) => {
                          const v = draft.videos ?? [];
                          [v[index + 1], v[index]] = [v[index], v[index + 1]];
                          v.forEach((item, order) => {
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
                          draft.videos?.splice(index, 1);
                        })
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div id="field-sections" className="space-y-4">
        <FieldError message={fieldErrors['sections']?.message} />
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
                  onClick={() => {
                    mutate((draft) => {
                      draft.sections.splice(sectionIndex, 1);
                      draft.sections.forEach((item, order) => {
                        item.sort_order = order;
                      });
                    });
                    clearFieldError('sections');
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                  {t('remove')}
                </Button>
              </div>
              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-navy text-xs font-bold">
                  {t('sectionTitle')}
                  <RequiredMark />
                </span>
                <input
                  id={`field-section-${sectionIndex}-title`}
                  className={cn(
                    adminFieldClassName,
                    fieldErrors[`section_${sectionIndex}_title_${locale}`] &&
                      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                  )}
                  placeholder={
                    locale === 'id'
                      ? 'Contoh: Mengenali Jebakan Ilusi Kontrol'
                      : 'e.g. Recognizing Illusion of Control Traps'
                  }
                  value={localized.title}
                  onChange={(event) => {
                    mutate((draft) => {
                      draft.sections[sectionIndex].translations[locale].title =
                        event.target.value;
                    });
                    clearFieldError(`section_${sectionIndex}_title_${locale}`);
                  }}
                />
                <FieldError message={fieldErrors[`section_${sectionIndex}_title_${locale}`]?.message} />
              </label>
              <div
                id={`field-section-${sectionIndex}-content`}
                className="mt-4 flex flex-col gap-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-navy text-xs font-bold">
                    {t('sectionContent')}
                    <RequiredMark />
                  </span>
                  <div className="flex items-center gap-2">
                    <TranslateButton
                      sourceLang={locale === 'en' ? 'id' : 'en'}
                      targetLang={locale === 'en' ? 'en' : 'id'}
                      customLabel={
                        locale === 'en'
                          ? 'Terjemahkan ID ➔ EN'
                          : 'Terjemahkan EN ➔ ID'
                      }
                      sourceTexts={collectRichTextStrings(
                        section.translations[locale === 'en' ? 'id' : 'en']?.content
                      )}
                      onTranslated={(translations) => {
                        mutate((draft) => {
                          let idx = 0;
                          const next = () => translations[idx++] ?? '';
                          const sourceContent =
                            draft.sections[sectionIndex].translations[
                              locale === 'en' ? 'id' : 'en'
                            ]?.content;
                          draft.sections[sectionIndex].translations[
                            locale
                          ].content = cloneAndTranslateRichText(
                            sourceContent,
                            next
                          );
                        });
                        clearFieldError(
                          `section_${sectionIndex}_content_${locale}`
                        );
                      }}
                      className="h-7 gap-1 px-2.5 text-[0.7rem]"
                    />
                    <span className="text-muted-foreground text-[0.6875rem]">
                      {t('sectionContentHelp')}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'rounded-xl',
                    fieldErrors[`section_${sectionIndex}_content_${locale}`] &&
                      'ring-destructive rounded-xl ring-2'
                  )}
                >
                  <RichTextEditor
                    value={localized.content}
                    placeholder={
                      locale === 'id'
                        ? 'Tuliskan materi dan penjelasan lengkap bagian ini di sini...'
                        : 'Write the section content and detailed explanation here...'
                    }
                    onChange={(content) => {
                      mutate((draft) => {
                        draft.sections[sectionIndex].translations[
                          locale
                        ].content = content;
                      });
                      clearFieldError(
                        `section_${sectionIndex}_content_${locale}`
                      );
                    }}
                    onRequestMedia={requestContentMedia}
                  />
                </div>
                <FieldError message={fieldErrors[`section_${sectionIndex}_content_${locale}`]?.message} />
              </div>

              <div className="mt-5 space-y-4 rounded-2xl border border-navy/15 bg-azure/50 p-4 sm:p-5">
                <div className="border-navy/10 flex items-center justify-between border-b pb-3">
                  <h4 className="text-navy text-sm font-extrabold">
                    {t('knowledgeCheck')}
                    <RequiredMark />
                  </h4>
                  <span className="text-muted-foreground text-[0.7rem]">
                    {t('choicesHelp')}
                  </span>
                </div>

                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-navy text-xs font-bold">
                      {t('question')}
                      <RequiredMark />
                    </span>
                    <span className="text-muted-foreground text-[0.6875rem]">
                      {t('questionHelp')}
                    </span>
                  </div>
                  <input
                    id={`field-section-${sectionIndex}-kc-question`}
                    className={cn(
                      adminFieldClassName,
                      fieldErrors[`section_${sectionIndex}_kc_question_${locale}`] &&
                        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                    )}
                    placeholder={
                      locale === 'id'
                        ? 'Contoh: Manakah dari pernyataan berikut yang mencerminkan ilusi kontrol?'
                        : 'e.g. Which of the following statements reflects the illusion of control?'
                    }
                    value={localized.knowledge_check.question}
                    onChange={(event) => {
                      mutate((draft) => {
                        draft.sections[sectionIndex].translations[
                          locale
                        ].knowledge_check.question = event.target.value;
                      });
                      clearFieldError(
                        `section_${sectionIndex}_kc_question_${locale}`
                      );
                    }}
                  />
                  <FieldError message={fieldErrors[`section_${sectionIndex}_kc_question_${locale}`]?.message} />
                </label>

                <div
                  id={`field-section-${sectionIndex}-kc-choices`}
                  className="space-y-2.5"
                >
                  <span className="text-navy block text-xs font-bold">
                    {t('choicesLabel')}
                    <RequiredMark />
                  </span>
                  <FieldError
                    message={
                      fieldErrors[`section_${sectionIndex}_kc_choices_${locale}`]?.message ||
                      fieldErrors[`section_${sectionIndex}_kc_correct_${locale}`]?.message
                    }
                  />
                  <div className="space-y-2">
                    {localized.knowledge_check.choices.map(
                      (choice, choiceIndex) => (
                        <div
                          key={choice.id}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${section.id}-${locale}`}
                              checked={
                                localized.knowledge_check.correct_choice_id ===
                                choice.id
                              }
                              onChange={() => {
                                mutate((draft) => {
                                  const sec = draft.sections[sectionIndex];
                                  for (const loc of ['id', 'en'] as const) {
                                    if (sec.translations[loc]?.knowledge_check) {
                                      sec.translations[loc].knowledge_check.correct_choice_id = choice.id;
                                    }
                                  }
                                });
                                clearFieldError(
                                  `section_${sectionIndex}_kc_correct_id`,
                                  `section_${sectionIndex}_kc_correct_en`
                                );
                              }}
                              className="accent-navy size-4 cursor-pointer"
                            />
                            <input
                              id={`field-section-${sectionIndex}-kc-choice-${choiceIndex}`}
                              className={cn(
                                `${adminFieldClassName} flex-1`,
                                fieldErrors[`section_${sectionIndex}_kc_choice_${choiceIndex}_${locale}`] &&
                                  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                              )}
                              placeholder={`${t('answer')} ${choiceIndex + 1}`}
                              value={choice.text}
                              onChange={(event) => {
                                mutate((draft) => {
                                  draft.sections[sectionIndex].translations[
                                    locale
                                  ].knowledge_check.choices[choiceIndex].text =
                                    event.target.value;
                                });
                                clearFieldError(
                                  `section_${sectionIndex}_kc_choice_${choiceIndex}_${locale}`,
                                  `section_${sectionIndex}_kc_choices_${locale}`
                                );
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                localized.knowledge_check.choices.length <= 2
                              }
                              onClick={() =>
                                mutate((draft) => {
                                  const sec = draft.sections[sectionIndex];
                                  for (const loc of ['id', 'en'] as const) {
                                    const kc =
                                      sec.translations[loc]?.knowledge_check;
                                    if (kc && kc.choices.length > 2) {
                                      kc.choices = kc.choices.filter(
                                        (c) => c.id !== choice.id
                                      );
                                      if (kc.correct_choice_id === choice.id) {
                                        kc.correct_choice_id =
                                          kc.choices[0]?.id || '';
                                      }
                                    }
                                  }
                                })
                              }
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-9 shrink-0 rounded-xl disabled:opacity-30"
                              title="Hapus pilihan"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <FieldError message={fieldErrors[`section_${sectionIndex}_kc_choice_${choiceIndex}_${locale}`]?.message} />
                        </div>
                      )
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      mutate((draft) => {
                        const sec = draft.sections[sectionIndex];
                        const newId = `choice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        for (const loc of ['id', 'en'] as const) {
                          if (sec.translations[loc]?.knowledge_check) {
                            sec.translations[loc].knowledge_check.choices.push({
                              id: newId,
                              text: '',
                            });
                          }
                        }
                      });
                      clearFieldError(`section_${sectionIndex}_kc_choices_${locale}`);
                    }}
                    className="border-navy/20 hover:border-navy/40 hover:bg-navy/5 text-navy rounded-xl border-dashed text-xs font-bold"
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Tambah pilihan
                  </Button>
                </div>

                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-navy text-xs font-bold">
                      {t('explanation')}
                      <RequiredMark />
                    </span>
                    <span className="text-muted-foreground text-[0.6875rem]">
                      {t('explanationHelp')}
                    </span>
                  </div>
                  <textarea
                    id={`field-section-${sectionIndex}-kc-explanation`}
                    className={cn(
                      `${adminFieldClassName} min-h-20 py-3`,
                      fieldErrors[`section_${sectionIndex}_kc_explanation_${locale}`] &&
                        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                    )}
                    placeholder={
                      locale === 'id'
                        ? 'Contoh: Ilusi kontrol adalah keyakinan semu bahwa seseorang dapat memengaruhi hasil dari peristiwa yang sepenuhnya bersifat acak.'
                        : 'e.g. Illusion of control is the false belief that one can influence the outcome of entirely random events.'
                    }
                    value={localized.knowledge_check.explanation}
                    onChange={(event) => {
                      mutate((draft) => {
                        draft.sections[sectionIndex].translations[
                          locale
                        ].knowledge_check.explanation = event.target.value;
                      });
                      clearFieldError(
                        `section_${sectionIndex}_kc_explanation_${locale}`
                      );
                    }}
                  />
                  <FieldError message={fieldErrors[`section_${sectionIndex}_kc_explanation_${locale}`]?.message} />
                </label>
              </div>
            </section>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            mutate((draft) => {
              draft.sections.push(makeSection(draft.sections.length));
            });
            clearFieldError('sections');
          }}
        >
          <Plus className="size-4" />
          {t('addSection')}
        </Button>
      </div>

      <section className="border-border bg-card grid gap-5 rounded-2xl border p-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('reviewerName')}
            <RequiredMark />
          </span>
          <input
            id="field-reviewer-name"
            className={cn(
              adminFieldClassName,
              fieldErrors['reviewer_name'] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder={
              locale === 'id'
                ? 'Contoh: Dr. Budi Santoso, M.Psi., Psikolog'
                : 'e.g. Dr. Budi Santoso, M.Psi., Psychologist'
            }
            value={document.reviewer_name}
            onChange={(event) => {
              mutate((draft) => {
                draft.reviewer_name = event.target.value;
              });
              clearFieldError('reviewer_name');
            }}
          />
          <FieldError message={fieldErrors['reviewer_name']?.message} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('reviewerRole')}
            <RequiredMark />
          </span>
          <input
            id="field-reviewer-role"
            className={cn(
              adminFieldClassName,
              fieldErrors[`reviewer_role_${locale}`] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            placeholder={
              locale === 'id'
                ? 'Contoh: Psikolog Klinis & Konselor Adiksi Perilaku'
                : 'e.g. Clinical Psychologist & Behavioral Addiction Counselor'
            }
            value={translation.reviewer_role}
            onChange={(event) => {
              mutate((draft) => {
                draft.translations[locale].reviewer_role = event.target.value;
              });
              clearFieldError(`reviewer_role_${locale}`);
            }}
          />
          <FieldError message={fieldErrors[`reviewer_role_${locale}`]?.message} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-navy text-xs font-bold">
            {t('reviewedAt')}
            <RequiredMark />
          </span>
          <input
            id="field-reviewed-at"
            type="date"
            className={cn(
              adminFieldClassName,
              fieldErrors['reviewed_at'] &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            value={document.reviewed_at}
            onChange={(event) => {
              mutate((draft) => {
                draft.reviewed_at = event.target.value;
              });
              clearFieldError('reviewed_at');
            }}
          />
          <FieldError message={fieldErrors['reviewed_at']?.message} />
        </label>
      </section>

      <section
        id="field-sources"
        className={cn(
          'border-border bg-card rounded-2xl border p-5',
          fieldErrors['sources'] && 'border-destructive'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-navy font-extrabold">
              {t('sources')}
              <RequiredMark />
            </h3>
            <FieldError message={fieldErrors['sources']?.message} />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              mutate((draft) => {
                draft.sources.push({
                  title: '',
                  publisher: '',
                  url: 'https://',
                  accessed_at: new Date().toISOString(),
                });
              });
              clearFieldError('sources');
            }}
          >
            <Plus className="size-4" />
            {t('addSource')}
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {document.sources.map((source, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="bg-muted/60 grid gap-2 rounded-xl p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
                <input
                  id={`field-source-title-${index}`}
                  className={cn(
                    adminFieldClassName,
                    fieldErrors[`source_${index}_title`] &&
                      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                  )}
                  placeholder={`${t('sourceTitle')} *`}
                  value={source.title}
                  onChange={(event) => {
                    mutate((draft) => {
                      draft.sources[index].title = event.target.value;
                    });
                    clearFieldError(`source_${index}_title`, 'sources');
                  }}
                />
                <input
                  className={adminFieldClassName}
                  placeholder={`${t('publisher')} (${t('optional')})`}
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
                    id={`field-source-url-${index}`}
                    className={cn(
                      `${adminFieldClassName} pl-10`,
                      fieldErrors[`source_${index}_url`] &&
                        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
                    )}
                    type="url"
                    value={source.url}
                    onChange={(event) => {
                      mutate((draft) => {
                        draft.sources[index].url = event.target.value;
                      });
                      clearFieldError(`source_${index}_url`, 'sources');
                    }}
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
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <FieldError
                message={
                  fieldErrors[`source_${index}_title`]?.message ||
                  fieldErrors[`source_${index}_url`]?.message
                }
              />
            </div>
          ))}
        </div>
      </section>

      <Dialog
        open={historyOpen}
        onOpenChange={(open) => {
          setHistoryOpen(open);
          if (!open) {
            setRollbackTarget(null);
            setRollbackReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-5 gap-3">
          {rollbackTarget ? (
            <div className="space-y-3">
              <DialogHeader className="gap-1 pb-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setRollbackTarget(null);
                      setRollbackReason('');
                    }}
                    className="size-7 rounded-lg text-muted-foreground hover:text-navy hover:bg-azure/50"
                    title={t('backToHistory')}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <DialogTitle className="text-navy text-base font-bold">
                    {t('rollbackConfirmTitle')}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed pl-9">
                  {t('rollbackConfirmHelp')}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-navy/20 bg-azure/25 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-navy text-sm font-extrabold">
                    {t('versionItemLabel', {
                      version: rollbackTarget.revision,
                    })}
                  </span>
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {rollbackTarget.kind === 'published'
                      ? 'Terbit'
                      : rollbackTarget.kind === 'draft'
                        ? 'Draf'
                        : 'Pemulihan'}
                  </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5 text-muted-foreground/70" />
                  <span>
                    {new Date(rollbackTarget.created_at).toLocaleString(
                      locale === 'id' ? 'id-ID' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </span>
                  {rollbackTarget.created_by && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[160px]">
                        oleh{' '}
                        <strong className="font-semibold text-foreground">
                          {rollbackTarget.created_by}
                        </strong>
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-navy flex items-center text-xs font-bold gap-1">
                  <span>{t('rollbackReasonLabel')}</span>
                  <span className="text-destructive">*</span>
                </label>
                <textarea
                  className={`${adminFieldClassName} min-h-20 py-2 text-xs leading-relaxed`}
                  rows={3}
                  placeholder={t('rollbackReasonPlaceholder')}
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
                    setRollbackTarget(null);
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
                  onClick={() => void handleConfirmRollback()}
                  className="font-bold gap-1.5 bg-navy text-white hover:bg-navy-light"
                >
                  <RotateCcw className="size-3.5" />
                  {t('confirmRollback')}
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
                  {t('revisionHistory')}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {t('revisionHistoryHelp')}
                </DialogDescription>
              </DialogHeader>

              {/* Revision List (Clean & Non-redundant) */}
              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-0.5">
                {revisions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    {t('noRevisions')}
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
                              {t('versionItemLabel', {
                                version: revision.revision,
                              })}
                            </span>
                            {isCurrentDraft && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-navy px-2 py-0.5 text-[11px] font-bold text-white">
                                <Check className="size-3" />
                                {t('activeDraftBadge')}
                              </span>
                            )}
                            {isPublished && (
                              <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                {t('publishedBadge')}
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
                                setRollbackTarget(revision);
                                setRollbackReason('');
                              }}
                              className="h-8 gap-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white"
                            >
                              <RotateCcw className="size-3.5" />
                              {t('restoreRevision')}
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              {t('deleteModuleTitle')}
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
              {t('deleteModuleConfirm', {
                title: moduleToDelete?.title || moduleToDelete?.slug || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setModuleToDelete(null);
              }}
              disabled={busy}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void handleConfirmDelete()}
              disabled={busy}
            >
              {t('deleteModule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
