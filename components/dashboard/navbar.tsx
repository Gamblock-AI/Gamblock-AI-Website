'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { Bell, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useTranslations } from "next-intl";

const pathnameToMeta: Record<string, { titleKey: string; subKey: string }> = {
  '/dashboard': { titleKey: 'titleDashboard', subKey: 'subDashboard' },
  '/progress': { titleKey: 'titleProgress', subKey: 'subProgress' },
  '/accountability': { titleKey: 'titleAccountability', subKey: 'subAccountability' },
  '/settings': { titleKey: 'titleSettings', subKey: 'subSettings' },
  '/partners': { titleKey: 'titlePartners', subKey: 'subPartners' },
  '/education': { titleKey: 'titleEducation', subKey: 'subEducation' },
  '/recovery': { titleKey: 'titleRecovery', subKey: 'subRecovery' },
  '/profile': { titleKey: 'titleProfile', subKey: 'subProfile' },
};

export function Navbar() {
    const t = useTranslations('navbar');
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ display_name: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUser = () => {
    const saved = localStorage.getItem('gamblock_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setTimeout(() => loadUser(), 0);
    const handleStorageChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    Swal.fire({
      title: t('logoutTitle'),
      text: t('logoutText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#888',
      confirmButtonText: t('logoutConfirm'),
      cancelButtonText: t('logoutCancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('gamblock_access_token');
        localStorage.removeItem('gamblock_refresh_token');
        localStorage.removeItem('gamblock_user');
        document.cookie =
          'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        router.push(ROUTES.LOGIN);
      }
    });
  };

  const meta = pathnameToMeta[pathname] || {
    titleKey: 'titleDashboard',
    subKey: 'subDashboard',
  };

  return (
    <nav className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      {/* Title */}
      <div className="min-w-0">
        <h1 className="text-title truncate text-base text-navy sm:text-lg">{t(meta.titleKey)}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{t(meta.subKey)}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Icons */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label={t('notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-crimson" />
        </button>

        <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" />

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-soft transition-transform hover:scale-105"
            title={user?.display_name || 'Profil'}
          >
            {user?.display_name
              ? user.display_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : <User className="h-4 w-4" />}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card py-1.5 shadow-card">
              {user && (
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-bold text-navy">
                    {user.display_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              )}

              <Link
                href={ROUTES.PROFILE}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-navy/5 hover:text-navy"
              >
                <User className="h-4 w-4" />
                {t('text_313')}
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-crimson transition-colors hover:bg-crimson/5"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
