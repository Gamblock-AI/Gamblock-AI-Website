import { redirect } from 'next/navigation';
import { ROUTES } from '@/routes';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}${ROUTES.DASHBOARD}`);
}
