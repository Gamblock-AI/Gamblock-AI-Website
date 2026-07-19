import { EmailVerificationClient } from './verification-client';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const value = (await searchParams).token;
  const token = Array.isArray(value) ? value[0] : value;
  return <EmailVerificationClient token={token ?? ''} />;
}
