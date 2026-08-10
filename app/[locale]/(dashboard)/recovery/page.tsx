import { redirect } from 'next/navigation';
import { RecoveryClient } from './_components/recovery-client';
import type { RangeDays } from './_components/progress-utils';

const VALID_RANGES = ['7', '30', '90'] as const;

export default async function RecoveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { locale } = await params;
  const requestedRange = (await searchParams).range;

  if (
    typeof requestedRange !== 'string' ||
    !(VALID_RANGES as readonly string[]).includes(requestedRange)
  ) {
    // Default to the first navigation tab (7 days) when no range query
    // parameter is present.
    redirect(`/${locale}/recovery?range=7`);
  }

  const range = Number(requestedRange) as RangeDays;

  return <RecoveryClient range={range} />;
}
