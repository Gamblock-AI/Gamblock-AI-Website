import { redirect } from 'next/navigation';

interface LegacyCreateGroupPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegacyCreateGroupPage({
  params,
}: LegacyCreateGroupPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/partners`);
}
