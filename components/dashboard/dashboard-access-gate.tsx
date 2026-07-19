'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAuthoritativeUser } from '@/hooks/use-local-user';
import { canAccessDashboardRoute, defaultRouteForRole, ROUTES } from '@/routes';

export function DashboardAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuthoritativeUser();
  const allowed =
    status === 'ready' && canAccessDashboardRoute(pathname, user.role);

  useEffect(() => {
    if (status === 'error') {
      router.replace(ROUTES.LOGIN);
    } else if (status === 'ready' && !allowed) {
      router.replace(defaultRouteForRole(user.role));
    }
  }, [allowed, router, status, user.role]);

  if (!allowed) {
    return (
      <div className="bg-background text-muted-foreground grid min-h-dvh place-items-center px-6 text-center text-sm">
        Memeriksa hak akses akun…
      </div>
    );
  }
  return children;
}
