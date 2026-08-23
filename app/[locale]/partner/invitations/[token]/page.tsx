import { redirect } from 'next/navigation';
import { ROUTES } from '@/routes';

interface LegacyPartnerInvitationPageProps {
  params: Promise<{ locale: string; token: string }>;
}

export default async function LegacyPartnerInvitationPage({
  params,
}: LegacyPartnerInvitationPageProps) {
  const { locale } = await params;

  redirect(`/${locale}${ROUTES.PARTNERS}`);
}
