import { useState } from 'react';
import { Check, Copy, Mail, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PartnerEmailInput } from './partner-email-input';

interface ConnectedPartnerDetailsProps {
  email: string;
  status: 'invited' | 'active';
  inviteUrl?: string | null;
  loading: boolean;
  onInvite: (email: string) => void;
  onRequestRevoke: () => void;
}

export function ConnectedPartnerDetails({
  email,
  status,
  inviteUrl,
  loading,
  onInvite,
  onRequestRevoke,
}: ConnectedPartnerDetailsProps) {
  const t = useTranslations('accountabilityWorkspace');
  const [copied, setCopied] = useState(false);
  const [inviteAnotherOpen, setInviteAnotherOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const copyInvite = () => {
    if (!inviteUrl) return;
    void navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    });
  };

  return (
    <div className="border-border bg-muted/45 rounded-2xl border p-4 sm:p-5">
      <p className="text-muted-foreground text-xs font-semibold">
        {t('connectedEmail')}
      </p>
      <p className="text-navy mt-1 text-sm font-bold break-all">{email}</p>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        {status === 'active' ? t('activePartnerHelp') : t('invitedPartnerHelp')}
      </p>
      {inviteUrl ? (
        <div className="border-amber/25 bg-amber/[0.05] mt-4 rounded-xl border p-3">
          <p className="text-navy text-xs font-semibold">
            {t('inviteLinkLabel')}
          </p>
          <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
            {inviteUrl}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={copyInvite}
          >
            {copied ? (
              <Check className="text-sage size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? t('inviteLinkCopied') : t('copyInviteLink')}
          </Button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="border-crimson/25 text-crimson hover:bg-crimson/[0.04] mt-4 w-full sm:w-auto"
        onClick={onRequestRevoke}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {t('revokePartner')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="mt-4 w-full sm:ml-2 sm:w-auto"
        onClick={() => setInviteAnotherOpen((open) => !open)}
      >
        <Mail className="size-4" aria-hidden="true" />
        {t('inviteAnother')}
      </Button>
      {inviteAnotherOpen ? (
        <form
          className="border-border bg-background mt-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onInvite(newEmail);
            setInviteAnotherOpen(false);
            setNewEmail('');
          }}
        >
          <PartnerEmailInput value={newEmail} onChange={setNewEmail} />
          <Button type="submit" disabled={loading}>
            {loading ? t('sendingInvite') : t('sendInvite')}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
