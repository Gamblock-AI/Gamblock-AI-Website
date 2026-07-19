import { type FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import { DashboardPanel } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useSupportRequest } from '@/hooks/use-support-request';
import { toastError, toastSuccess } from '@/lib/feedback';

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
  const [impact, setImpact] = useState('can_continue');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    if (!cleanSubject || !cleanDescription) return;

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
        className="flex flex-1 flex-col space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SupportSelect
            id="support-category"
            label={t('categoryLabel')}
            value={category}
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
            onChange={setImpact}
          >
            <option value="can_continue">{t('impacts.canContinue')}</option>
            <option value="partly_blocked">{t('impacts.partlyBlocked')}</option>
            <option value="fully_blocked">{t('impacts.fullyBlocked')}</option>
            <option value="safety_concern">{t('impacts.safetyConcern')}</option>
          </SupportSelect>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="support-subject"
            className="text-navy text-sm font-semibold"
          >
            {t('subjectLabel')}
          </label>
          <input
            id="support-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={t('subjectPlaceholder')}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            required
          />
        </div>
        <div className="flex flex-1 flex-col space-y-2">
          <label
            htmlFor="support-description"
            className="text-navy text-sm font-semibold"
          >
            {t('descriptionLabel')}
          </label>
          <textarea
            id="support-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={6}
            aria-describedby="support-privacy-help"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 min-h-40 w-full flex-1 resize-y rounded-xl border p-3 text-sm leading-6 outline-none focus-visible:ring-2"
            required
          />
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
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-navy text-sm font-semibold">
        {label}
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
