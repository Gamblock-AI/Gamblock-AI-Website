import { redirect } from 'next/navigation';
import { DASHBOARD_QUERY_KEYS, ROUTES } from '@/routes';
import { RecoveryClient } from './_components/recovery-client';
import type { RangeDays } from './_components/progress-utils';

const VALID_RANGES = ['7', '30', '90'] as const;
const LEGACY_QUERY_KEYS = ['channel', 'range', 'tab'] as const;

type RecoveryPageSearchParams = Record<
  string,
  string | string[] | undefined
>;

function toSearchParams(searchParams: RecoveryPageSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, item);
    }
  }

  return params;
}

export default async function RecoveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RecoveryPageSearchParams>;
}) {
  const { locale } = await params;
  const currentSearchParams = toSearchParams(await searchParams);
  const queryKey = DASHBOARD_QUERY_KEYS.recoveryTab;
  const requestedRanges = currentSearchParams.getAll(queryKey);
  const requestedRange = requestedRanges[0];
  const hasLegacyQuery = LEGACY_QUERY_KEYS.some((key) =>
    currentSearchParams.has(key)
  );
  const isCanonical =
    requestedRanges.length === 1 &&
    VALID_RANGES.includes(requestedRange as (typeof VALID_RANGES)[number]);

  if (!isCanonical || hasLegacyQuery) {
    currentSearchParams.delete(queryKey);
    currentSearchParams.set(queryKey, isCanonical ? requestedRange! : '7');
    for (const key of LEGACY_QUERY_KEYS) currentSearchParams.delete(key);
    redirect(
      `/${locale}${ROUTES.RECOVERY}?${currentSearchParams.toString()}`
    );
  }

  const range = Number(requestedRange) as RangeDays;

  return <RecoveryClient range={range} />;
}
