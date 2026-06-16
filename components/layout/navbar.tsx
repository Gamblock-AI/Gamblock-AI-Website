'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Bell, Shield, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pathnameToTitle: Record<string, string> = {
  '/dashboard': 'Analitik Perlindungan',
  '/progress': 'Analitik',
  '/accountability': 'Lingkaran Sosial',
  '/settings': 'Pengaturan',
  '/partners': 'Mitra',
  '/education': 'Psikoedukasi',
  '/recovery': 'Rehabilitasi',
  '/profile': 'Perbarui Profil',
};

export function Navbar() {
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
      title: 'Apakah Anda yakin ingin keluar?',
      text: 'Anda harus masuk kembali untuk melihat dashboard.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C8102E',
      cancelButtonColor: '#888',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('gamblock_access_token');
        localStorage.removeItem('gamblock_refresh_token');
        localStorage.removeItem('gamblock_user');
        document.cookie =
          'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        router.push(ROUTES.LOGIN);
      }
    });
  };

  const currentTitle = pathnameToTitle[pathname] || 'Analitik Perlindungan';

  return (
    <nav className="relative z-40 flex shrink-0 items-center justify-between border-b border-border bg-card/80 px-5 py-2.5 backdrop-blur-md">
      {/* Breadcrumb */}
      <span className="text-label text-navy/80">{currentTitle}</span>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.RECOVERY}>
          <Button variant="wellness" size="sm">
            <BookOpen className="h-3.5 w-3.5" />
            Jurnal Refleksi
          </Button>
        </Link>

        {/* Icons */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <button className="relative cursor-pointer transition-colors hover:text-navy">
            <Bell className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-crimson" />
          </button>
          <button className="cursor-pointer transition-colors hover:text-navy">
            <Shield className="h-5 w-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-muted/50 text-xs font-bold text-foreground transition-colors hover:border-navy/30 hover:text-navy"
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
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-border bg-card py-1.5 shadow-lg">
              {user && (
                <div className="border-b border-border px-4 py-2">
                  <p className="truncate text-xs font-bold text-foreground">
                    {user.display_name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              )}

              <Link
                href={ROUTES.PROFILE}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Perbarui Profil
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-xs font-semibold text-crimson/80 transition-colors hover:bg-crimson/5"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
