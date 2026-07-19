import { SupportWorkspaceClient } from './_components/support-workspace-client';

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string | string[] }>;
}) {
  const requestedChannel = (await searchParams).channel;
  const channel = requestedChannel === 'partner' ? 'partner' : 'team';

  return <SupportWorkspaceClient channel={channel} />;
}
