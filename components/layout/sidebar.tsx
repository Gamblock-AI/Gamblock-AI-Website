'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, Users, Handshake, GraduationCap, Heart, Settings } from 'lucide-react';
import { SidebarItem } from './sidebar-item';

const sections = [
  {
    title: 'PEMANTAUAN',
    items: [
      { href: ROUTES.DASHBOARD, label: 'Beranda', icon: Home },
      { href: ROUTES.PROGRESS, label: 'Analitik', icon: BarChart2 },
    ],
  },
  {
    title: 'AKUNTABILITAS',
    items: [
      { href: ROUTES.ACCOUNTABILITY, label: 'Lingkaran Sosial', icon: Users },
      { href: ROUTES.SETTINGS, label: 'Pengaturan', icon: Settings },
      { href: ROUTES.PARTNERS, label: 'Mitra', icon: Handshake },
    ],
  },
  {
    title: 'SUMBER DAYA',
    items: [
      { href: ROUTES.EDUCATION, label: 'Psikoedukasi', icon: GraduationCap },
      { href: ROUTES.RECOVERY, label: 'Rehabilitasi', icon: Heart },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-[260px] shrink-0 flex-col border-r border-border bg-card p-5">
      {/* Branding */}
      <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
          G
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold leading-none tracking-tight text-navy">
            Gamblock AI
          </span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
            On-Device Shield
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="mt-8 space-y-5">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            <span className="mb-1 block px-3 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
              {sec.title}
            </span>
            {sec.items.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== '/dashboard' && pathname.startsWith(href + '/'));
              return (
                <SidebarItem
                  key={href}
                  href={href}
                  label={label}
                  icon={Icon}
                  isActive={isActive}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span className="text-[10px] font-semibold text-muted-foreground">
              Sistem Aktif & Terproteksi
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
