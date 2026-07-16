import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PartnerEmailInputProps {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  includeHelp?: boolean;
}

export function PartnerEmailInput({
  id,
  value,
  disabled,
  onChange,
  includeHelp = false,
}: PartnerEmailInputProps) {
  const t = useTranslations('accountabilityWorkspace');
  const inputId = id ?? 'new-partner-email';
  const helpId = `${inputId}-help`;

  return (
    <div className="space-y-2">
      {includeHelp ? (
        <>
          <label htmlFor={inputId} className="text-navy text-sm font-semibold">
            {t('partnerEmailLabel')}
          </label>
          <p id={helpId} className="text-muted-foreground text-xs leading-5">
            {t('partnerEmailHelp')}
          </p>
        </>
      ) : null}
      <div className="relative">
        {includeHelp ? (
          <Mail
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={inputId}
          type="email"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={includeHelp ? helpId : undefined}
          autoComplete="email"
          placeholder={t('partnerEmailPlaceholder')}
          disabled={disabled}
          className={`border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            includeHelp ? 'pr-4 pl-10' : 'px-3'
          }`}
          required
        />
      </div>
    </div>
  );
}
