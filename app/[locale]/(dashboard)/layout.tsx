import { Sidebar } from '@/components/dashboard/sidebar';
import { Navbar } from '@/components/dashboard/navbar';
import { MobileNavigation } from '@/components/dashboard/mobile-navigation';
import { StudentGamificationFab } from '@/components/dashboard/student-gamification-fab';
import { StudentDailyCheckInGate } from '@/components/dashboard/student-daily-check-in-gate';
import { PageTransition } from '@/components/common/PageTransition';
import { getTranslations } from 'next-intl/server';
import { DashboardAccessGate } from '@/components/dashboard/dashboard-access-gate';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('dashboardNav');

  return (
    <DashboardAccessGate>
      <div className="dashboard-theme dashboard-canvas min-h-dvh">
        <a
          href="#dashboard-content"
          className="bg-navy shadow-card focus:ring-sky fixed top-4 left-4 z-[70] -translate-y-24 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-transform outline-none focus:translate-y-0 focus:ring-2 focus:ring-offset-2 motion-reduce:transition-none"
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
              className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] outline-none sm:px-6 sm:pt-7 lg:px-8 lg:pt-8 lg:pb-10 xl:px-10"
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        <MobileNavigation />
        <StudentGamificationFab />
        <StudentDailyCheckInGate />
      </div>
    </DashboardAccessGate>
  );
}
