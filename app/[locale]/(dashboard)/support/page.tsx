import { redirect } from 'next/navigation';
import { SupportWorkspaceClient } from './_components/support-workspace-client';

export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ channel?: string | string[] }>;
}) {
  const { locale } = await params;
  const requestedChannel = (await searchParams).channel;

  if (
    requestedChannel !== 'partner' &&
    requestedChannel !== 'hotline' &&
    requestedChannel !== 'team'
  ) {
    // Default to the first navigation tab (partner channel) when no channel
    // query parameter is present.
    redirect(`/${locale}/support?channel=partner`);
  }

  const channel =
    requestedChannel === 'hotline'
      ? 'hotline'
      : requestedChannel === 'team'
        ? 'team'
        : 'partner';

  return <SupportWorkspaceClient channel={channel} />;
}
