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
import {
  ChevronDown,
  FileLock2,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { notifyLocalUserChanged, useLocalUser } from '@/hooks/use-local-user';
import { useRecoverySync } from '@/hooks/use-recovery-sync';
import { GlobalSearch } from './global-search';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { AvatarImage } from '@/components/account/avatar-image';
import { logout } from '@/lib/auth';

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

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('gamblock_refresh_token');
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // Local removal still closes the session if the API is unavailable.
      }
    }
    localStorage.removeItem('gamblock_access_token');
    localStorage.removeItem('gamblock_refresh_token');
    localStorage.removeItem('gamblock_user');
    notifyLocalUserChanged();
    document.cookie = 'gamblock_access_token=; path=/; max-age=0; SameSite=Lax';
    setLogoutOpen(false);
    router.push(ROUTES.LOGIN);
  };

  return (
    <>
      <header className="border-border/90 bg-card/92 sticky top-0 z-40 flex h-[4.5rem] shrink-0 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6 lg:justify-between xl:px-8">
        <div className="flex flex-1 items-center justify-start lg:hidden">
          <Link
            href={ROUTES.DASHBOARD}
            className="text-navy focus-visible:ring-navy/30 rounded-lg text-base font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Gamblock<span className="text-navy-light">-AI</span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-start">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="lg:hidden">
            <GlobalSearch variant="icon" />
          </div>
          <LanguageSwitcher />
          <div className="relative" ref={profileAreaRef}>
            <button
              ref={profileTriggerRef}
              type="button"
              aria-controls={PROFILE_PANEL_ID}
              aria-expanded={profileOpen}
              aria-label={t('openProfileMenu')}
              onClick={() => setProfileOpen((open) => !open)}
              className="border-border bg-card text-navy hover:border-navy/25 hover:bg-azure/45 focus-visible:ring-navy/35 flex min-h-11 items-center gap-2 rounded-xl border px-1.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:px-2"
            >
              <AvatarImage
                avatarUrl={user.avatar_url}
                alt=""
                fallback={
                  initials ?? (
                    <UserRound className="size-4" aria-hidden="true" />
                  )
                }
                className="bg-azure text-navy flex size-8 items-center justify-center rounded-lg text-xs font-bold"
              />
              <span className="hidden max-w-36 truncate sm:block">
                {user?.display_name || t('profileFallback')}
              </span>
              <ChevronDown
                className={`text-muted-foreground hidden size-4 transition-transform duration-200 motion-reduce:transition-none sm:block ${
                  profileOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {profileOpen && (
              <div
                id={PROFILE_PANEL_ID}
                className="animate-in border-border bg-card shadow-card fade-in slide-in-from-top-1 absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border p-2 duration-150 motion-reduce:animate-none"
              >
                <div className="border-border border-b px-3 py-3">
                  <p className="text-navy truncate text-sm font-bold">
                    {user?.display_name || t('profileFallback')}
                  </p>
                  {user?.email && (
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setProfileOpen(false)}
                    className="text-foreground hover:bg-muted focus-visible:ring-navy/30 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                    {t('profile')}
                  </Link>
                  <Link
                    href={ROUTES.SETTINGS}
                    onClick={() => setProfileOpen(false)}
                    className="text-foreground hover:bg-muted focus-visible:ring-navy/30 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                  >
                    <Settings className="size-4" aria-hidden="true" />
                    {t('settings')}
                  </Link>
                  <Link
                    href={ROUTES.DATA_REQUESTS}
                    onClick={() => setProfileOpen(false)}
                    className="text-foreground hover:bg-muted focus-visible:ring-navy/30 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                  >
                    <FileLock2 className="size-4" aria-hidden="true" />
                    {t('dataRequests')}
                  </Link>
                  <button
                    type="button"
                    onClick={openLogoutConfirmation}
                    className="text-crimson hover:bg-crimson/5 focus-visible:ring-crimson/30 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent
          className="rounded-2xl p-5 sm:max-w-md"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-navy text-lg font-bold">
              {t('logoutTitle')}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {t('logoutDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-5 mt-1 -mb-5 rounded-b-2xl px-5 py-4">
            <DialogClose render={<Button variant="outline" size="lg" />}>
              {t('logoutCancel')}
            </DialogClose>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => void handleLogout()}
            >
              {t('logoutConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
