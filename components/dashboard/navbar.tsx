'use client';

import { Link, useRouter } from '@/i18n/routing';
import { ROUTES } from '@/routes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronDown, FileLock2, LogOut, Settings, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { notifyLocalUserChanged, useLocalUser } from '@/hooks/use-local-user';
import { useRecoverySync } from '@/hooks/use-recovery-sync';

const PROFILE_PANEL_ID = 'dashboard-profile-panel';

export function Navbar() {
  const t = useTranslations('dashboardNav');
  const router = useRouter();
  const user = useLocalUser();
  useRecoverySync();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileAreaRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        profileAreaRef.current &&
        !profileAreaRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileOpen]);

  const initials = user.display_name
    ? user.display_name
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  const openLogoutConfirmation = () => {
    setProfileOpen(false);
    setLogoutOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('gamblock_access_token');
    localStorage.removeItem('gamblock_refresh_token');
    localStorage.removeItem('gamblock_user');
    notifyLocalUserChanged();
    document.cookie =
      'gamblock_access_token=; path=/; max-age=0; SameSite=Lax';
    setLogoutOpen(false);
    router.push(ROUTES.LOGIN);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[76px] shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6 lg:justify-end">
        <Link
          href={ROUTES.DASHBOARD}
          className="rounded-lg text-base font-extrabold tracking-tight text-navy outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2 lg:hidden"
        >
          Gamblock<span className="text-navy-light">-AI</span>
        </Link>

        <div className="relative" ref={profileAreaRef}>
          <button
            ref={profileTriggerRef}
            type="button"
            aria-controls={PROFILE_PANEL_ID}
            aria-expanded={profileOpen}
            aria-label={t('openProfileMenu')}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-2 text-sm font-semibold text-navy shadow-soft outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-azure text-xs font-bold text-navy">
              {initials ?? <UserRound className="size-4" aria-hidden="true" />}
            </span>
            <span className="hidden max-w-36 truncate sm:block">
              {user?.display_name || t('profileFallback')}
            </span>
            <ChevronDown
              className={`hidden size-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none sm:block ${
                profileOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              id={PROFILE_PANEL_ID}
              className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-card"
            >
              <div className="border-b border-border px-3 py-3">
                <p className="truncate text-sm font-bold text-navy">
                  {user?.display_name || t('profileFallback')}
                </p>
                {user?.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setProfileOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-navy/30"
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  {t('profile')}
                </Link>
                <Link
                  href={ROUTES.SETTINGS}
                  onClick={() => setProfileOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-navy/30"
                >
                  <Settings className="size-4" aria-hidden="true" />
                  {t('settings')}
                </Link>
                <Link
                  href={ROUTES.DATA_REQUESTS}
                  onClick={() => setProfileOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-navy/30"
                >
                  <FileLock2 className="size-4" aria-hidden="true" />
                  {t('dataRequests')}
                </Link>
                <button
                  type="button"
                  onClick={openLogoutConfirmation}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-crimson outline-none transition-colors hover:bg-crimson/5 focus-visible:ring-2 focus-visible:ring-crimson/30"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent
          className="rounded-2xl p-5 sm:max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy">
              {t('logoutTitle')}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {t('logoutDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-5 -mb-5 mt-1 rounded-b-2xl px-5 py-4">
            <DialogClose render={<Button variant="outline" size="lg" />}>
              {t('logoutCancel')}
            </DialogClose>
            <Button variant="destructive" size="lg" onClick={handleLogout}>
              {t('logoutConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
