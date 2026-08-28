import { redirect } from 'next/navigation';
import { DASHBOARD_QUERY_KEYS, ROUTES } from '@/routes';
import { SupportWorkspaceClient } from './_components/support-workspace-client';

const VALID_CHANNELS = ['partner', 'team', 'hotline'] as const;
const LEGACY_QUERY_KEYS = ['channel', 'range', 'tab'] as const;

type SupportPageSearchParams = Record<
  string,
  string | string[] | undefined
>;

function toSearchParams(searchParams: SupportPageSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      params.append(key, item);
    }
  }

  return params;
}

export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SupportPageSearchParams>;
}) {
  const { locale } = await params;
  const currentSearchParams = toSearchParams(await searchParams);
  const queryKey = DASHBOARD_QUERY_KEYS.supportTab;
  const requestedChannels = currentSearchParams.getAll(queryKey);
  const requestedChannel = requestedChannels[0];
  const hasLegacyQuery = LEGACY_QUERY_KEYS.some((key) =>
    currentSearchParams.has(key)
  );
  const isCanonical =
    requestedChannels.length === 1 &&
    VALID_CHANNELS.includes(
      requestedChannel as (typeof VALID_CHANNELS)[number]
    );

  if (!isCanonical || hasLegacyQuery) {
    currentSearchParams.delete(queryKey);
    currentSearchParams.set(
      queryKey,
      isCanonical ? requestedChannel! : 'partner'
    );
    for (const key of LEGACY_QUERY_KEYS) currentSearchParams.delete(key);
    redirect(
      `/${locale}${ROUTES.SUPPORT}?${currentSearchParams.toString()}`
    );
  }

  return <SupportWorkspaceClient />;
}
