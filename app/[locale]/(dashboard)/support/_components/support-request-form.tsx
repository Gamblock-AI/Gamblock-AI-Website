import { type FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  FieldError,
  OptionalMark,
  RequiredMark,
} from '@/components/common/form-field';
import { useSupportRequest } from '@/hooks/use-support-request';
import { toastError, toastSuccess, toastValidationError } from '@/lib/feedback';
import { cn } from '@/lib/utils';

interface SupportRequestFormProps {
  submitting: boolean;
  createCase: ReturnType<typeof useSupportRequest>['createCase'];
}

export function SupportRequestForm({
  submitting,
  createCase,
}: SupportRequestFormProps) {
  const t = useTranslations('supportWorkspace');
  const [category, setCategory] = useState('technical_support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [impact, setImpact] = useState('question');
  const [errors, setErrors] = useState<{
    subject?: string;
    description?: string;
  }>({});

  const clearError = (key: 'subject' | 'description') => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    const newErrors: { subject?: string; description?: string } = {};

    if (!cleanSubject) {
      newErrors.subject = 'Subjek tiket bantuan wajib diisi.';
    }
    if (!cleanDescription) {
      newErrors.description = 'Deskripsi permasalahan wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstFieldId = newErrors.subject
        ? 'support-subject'
        : 'support-description';
      const el =
        typeof window !== 'undefined'
          ? window.document.getElementById(firstFieldId)
          : null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      toastValidationError('Silakan lengkapi formulir tiket bantuan.');
      return;
    }

    try {
      await createCase({
        type: category,
        priority,
        impact,
        summary: cleanSubject,
        detail: cleanDescription,
      });
      setSubject('');
      setDescription('');
      setPriority('normal');
      setImpact('question');
      setErrors({});
      toastSuccess(t('success'));
    } catch (error) {
      toastError(error, t('error'));
    }
  };

  return (
    <DashboardPanel
      icon={Send}
      title={t('formTitle')}
      description={t('formBody')}
      className="flex h-full flex-col xl:col-span-8"
      contentClassName="flex flex-1 flex-col"
    >
      <form
        onSubmit={(event) => void submit(event)}
        noValidate
        className="flex flex-1 flex-col space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SupportSelect
            id="support-category"
            label={t('categoryLabel')}
            value={category}
            required
            onChange={setCategory}
          >
            <option value="technical_support">
              {t('categories.technical')}
            </option>
            <option value="device_recovery">{t('categories.device')}</option>
            <option value="accountability_guidance">
              {t('categories.accountability')}
            </option>
            <option value="privacy_request">{t('categories.privacy')}</option>
          </SupportSelect>
          <SupportSelect
            id="support-priority"
            label={t('priorityLabel')}
            value={priority}
            required
            onChange={setPriority}
          >
            <option value="low">{t('priorities.low')}</option>
            <option value="normal">{t('priorities.normal')}</option>
            <option value="high">{t('priorities.high')}</option>
            <option value="urgent">{t('priorities.urgent')}</option>
          </SupportSelect>
          <SupportSelect
            id="support-impact"
            label={t('impactLabel')}
            value={impact}
            optional
            onChange={setImpact}
            className="sm:col-span-2"
          >
            <option value="question">{t('impacts.canContinue')}</option>
            <option value="degraded">{t('impacts.partlyBlocked')}</option>
            <option value="blocked">{t('impacts.fullyBlocked')}</option>
            <option value="safety">{t('impacts.safetyConcern')}</option>
          </SupportSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="support-subject"
            className="text-navy flex items-center text-sm font-semibold"
          >
            <span>{t('subjectLabel')}</span>
            <RequiredMark />
          </label>
          <input
            id="support-subject"
            type="text"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              clearError('subject');
            }}
            placeholder={t('subjectPlaceholder')}
            className={cn(
              'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2',
              errors.subject &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            required
          />
          <FieldError message={errors.subject} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="support-description"
            className="text-navy flex items-center text-sm font-semibold"
          >
            <span>{t('descriptionLabel')}</span>
            <RequiredMark />
          </label>
          <textarea
            id="support-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              clearError('description');
            }}
            placeholder={t('descriptionPlaceholder')}
            rows={6}
            aria-describedby="support-privacy-help"
            className={cn(
              'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 min-h-40 w-full flex-1 resize-y rounded-xl border p-3 text-sm leading-6 outline-none focus-visible:ring-2',
              errors.description &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
            )}
            required
          />
          <FieldError message={errors.description} />
          <p
            id="support-privacy-help"
            className="text-muted-foreground text-xs leading-5"
          >
            {t('descriptionHelp')}
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-auto w-full sm:w-auto"
        >
          <Send className="size-4" aria-hidden="true" />
          {submitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </DashboardPanel>
  );
}

function SupportSelect({
  id,
  label,
  value,
  required,
  optional,
  onChange,
  className,
  children,
}: {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  optional?: boolean;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="text-navy flex items-center text-sm font-semibold">
        <span>{label}</span>
        {required ? <RequiredMark /> : null}
        {optional ? <OptionalMark /> : null}
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </NativeSelect>
    </div>
  );
}
