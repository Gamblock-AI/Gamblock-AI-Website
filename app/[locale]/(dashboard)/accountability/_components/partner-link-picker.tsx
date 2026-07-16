import { useTranslations } from 'next-intl';
import type { PartnerLink } from '@/hooks/use-accountability';

interface PartnerLinkPickerProps {
  links: PartnerLink[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function PartnerLinkPicker({
  links,
  selectedId,
  onSelect,
}: PartnerLinkPickerProps) {
  const t = useTranslations('accountabilityWorkspace');
  const visibleLinks = links.filter(
    (partner) => partner.status === 'active' || partner.status === 'invited'
  );

  if (visibleLinks.length <= 1) return null;

  return (
    <div className="mb-4 space-y-2">
      <p className="text-muted-foreground text-xs font-semibold">
        {t('relationshipListLabel')}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {visibleLinks.map((partner) => (
          <button
            key={partner.id}
            type="button"
            onClick={() => onSelect?.(partner.id)}
            className={`focus-visible:ring-navy/25 min-h-11 rounded-xl border p-3 text-left text-sm transition-colors focus-visible:ring-2 ${
              partner.id === selectedId
                ? 'border-navy bg-azure/45 text-navy'
                : 'border-border bg-background text-muted-foreground hover:border-navy/30'
            }`}
          >
            <span className="block truncate font-semibold">
              {partner.partner_email}
            </span>
            <span className="mt-1 block text-xs">
              {partner.status === 'active'
                ? t('partnerStatus.active')
                : t('partnerStatus.invited')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
