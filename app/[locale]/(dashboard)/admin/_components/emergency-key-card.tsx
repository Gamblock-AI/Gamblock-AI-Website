import { CheckCircle2, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmergencyKeyCardProps {
  emergencyKey: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function EmergencyKeyCard({
  emergencyKey,
  copied,
  onCopy,
  onClose,
}: EmergencyKeyCardProps) {
  const t = useTranslations('adminPage');

  return (
    <Card className="border-sage/30 bg-sage/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-sage size-5" />
          <div>
            <h3 className="text-navy font-bold">{t('keyReady')}</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('keyReadyBody')}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
      <div className="border-border bg-background mt-4 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
        <code className="text-navy flex-1 text-center font-mono text-lg font-bold tracking-[0.18em] select-all sm:text-left">
          {emergencyKey}
        </code>
        <Button variant="outline" size="sm" onClick={onCopy}>
          {copied ? (
            <CheckCircle2 className="text-sage mr-2 size-4" />
          ) : (
            <Copy className="mr-2 size-4" />
          )}
          {copied ? t('copied') : t('copy')}
        </Button>
      </div>
    </Card>
  );
}
