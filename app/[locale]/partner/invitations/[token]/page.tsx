import { redirect } from 'next/navigation';

interface LegacyPartnerInvitationPageProps {
  params: Promise<{ locale: string; token: string }>;
}

export default async function LegacyPartnerInvitationPage({
  params,
}: LegacyPartnerInvitationPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/partners`);
}
