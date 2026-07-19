import { ConfirmDeleteClient } from './confirm-delete-client';

interface ConfirmDeletePageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ConfirmDeletePage({
  searchParams,
}: ConfirmDeletePageProps) {
  const { token = '' } = await searchParams;
  return (
    <ConfirmDeleteClient
      token={Array.isArray(token) ? (token[0] ?? '') : token}
    />
  );
}
