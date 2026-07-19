import { Skeleton } from '@/components/ui/skeleton';

export function AccountabilityLoading({ label }: { label: string }) {
  return (
    <div
      className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]"
      role="status"
      aria-label={label}
    >
      <Skeleton className="min-h-[28rem] rounded-2xl" />
      <div className="space-y-5">
        <Skeleton className="min-h-48 rounded-2xl" />
        <Skeleton className="min-h-72 rounded-2xl" />
      </div>
    </div>
  );
}
