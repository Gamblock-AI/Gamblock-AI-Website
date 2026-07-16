import { Sidebar } from '@/components/dashboard/sidebar';
import { Navbar } from '@/components/dashboard/navbar';
import { MobileNavigation } from '@/components/dashboard/mobile-navigation';
import { PageTransition } from '@/components/common/PageTransition';
import { getTranslations } from 'next-intl/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('dashboardNav');

  return (
    <div className="dashboard-theme bg-mesh min-h-dvh">
      <a
        href="#dashboard-content"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-card outline-none transition-transform focus:translate-y-0 focus:ring-2 focus:ring-sky focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t('skipToContent')}
      </a>

      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main
            id="dashboard-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-[1280px] flex-1 px-5 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] outline-none sm:px-7 sm:pt-6 lg:px-8 lg:pb-9"
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}
