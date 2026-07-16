import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AdminNoAccess({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Card className="border-amber/30 flex items-start gap-3 p-5">
      <AlertCircle className="text-amber mt-0.5 size-5" aria-hidden="true" />
      <div>
        <h2 className="text-navy font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">{body}</p>
      </div>
    </Card>
  );
}

export function AdminLoadingState({ label }: { label: string }) {
  return (
    <Card className="text-muted-foreground flex min-h-56 items-center justify-center gap-2 p-6 text-sm font-semibold">
      <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />
      {label}
    </Card>
  );
}

export function AdminErrorState({
  label,
  retryLabel,
  onRetry,
}: {
  label: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
      <AlertCircle className="text-crimson size-7" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">{label}</p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-2 size-4" />
        {retryLabel}
      </Button>
    </Card>
  );
}
