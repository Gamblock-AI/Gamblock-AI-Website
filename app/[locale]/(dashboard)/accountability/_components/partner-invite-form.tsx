import { type FormEvent } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PartnerEmailInput } from './partner-email-input';

interface PartnerInviteFormProps {
  email: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onInvite: (email: string) => void;
}

export function PartnerInviteForm({
  email,
  loading,
  onEmailChange,
  onInvite,
}: PartnerInviteFormProps) {
  const t = useTranslations('accountabilityWorkspace');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onInvite(email);
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <PartnerEmailInput
        id="partner-email"
        value={email}
        disabled={loading}
        onChange={onEmailChange}
        includeHelp
      />
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full sm:w-auto"
      >
        <HeartHandshake className="size-4" aria-hidden="true" />
        {loading ? t('sendingInvite') : t('sendInvite')}
      </Button>
    </form>
  );
}
