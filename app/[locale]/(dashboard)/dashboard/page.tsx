'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
  Ban,
  ShieldCheck,
  Clock,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { ProtectionStats } from './ProtectionStats';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { PeakHoursChart } from './PeakHoursChart';
import { BlockedCategories } from './BlockedCategories';
import { LastInterventions } from './LastInterventions';
import { apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Reveal } from '@/components/common/Reveal';
import { useTranslations } from "next-intl";

interface OrgAnalytics {
  total_members: number;
  active_devices: number;
  avg_mood_score: number;
  total_blocks: number;
  completed_missions: number;
  pending_approvals: number;
  weekly_block_trend: number[];
}

interface OrgMember {
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  status: string;
}

const KEPALA_CARDS = [
  { icon: Users, labelKey: 'cardTotalMembers', key: 'total_members' as const, color: 'text-navy-light', chip: 'bg-navy/20' },
  { icon: Shield, labelKey: 'cardActiveDevices', key: 'active_devices' as const, color: 'text-sage-light', chip: 'bg-sage/20' },
  { icon: Ban, labelKey: 'cardTotalBlocks', key: 'total_blocks' as const, color: 'text-crimson', chip: 'bg-crimson/20' },
  { icon: CheckCircle, labelKey: 'cardCompletedMissions', key: 'completed_missions' as const, color: 'text-amber', chip: 'bg-amber/20' },
];

export default function DashboardPage() {
    const t = useTranslations('dashboardPage');
  const { summary } = useDashboardData();
  // Hydrate user from localStorage via lazy initializers (avoids synchronous
  // setState in the effect body — lint-safe, no cascading render).
  const [userRole] = useState<string>(() => {
    if (typeof window === 'undefined') return 'user';
    try {
      return JSON.parse(localStorage.getItem('gamblock_user') || '{}').role || 'user';
    } catch {
      return 'user';
    }
  });
  const [userName] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Pengguna';
    try {
      return JSON.parse(localStorage.getItem('gamblock_user') || '{}').display_name || 'Pengguna';
    } catch {
      return 'Pengguna';
    }
  });
  const [orgAnalytics, setOrgAnalytics] = useState<OrgAnalytics | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);

  useEffect(() => {
    // Fetch org data on mount. setState only after `await` (lint-safe, no
    // setTimeout). A 404/no-org is expected for Member users, so it is swallowed.
    let active = true;
    (async () => {
      try {
        const orgData = await apiClient<{ id: string }>('/organizations/mine');
        if (!active || !orgData?.id) return;
        const [analytics, memberList] = await Promise.all([
          apiClient<OrgAnalytics>(`/organizations/${orgData.id}/analytics`),
          apiClient<OrgMember[]>(`/organizations/${orgData.id}/members`),
        ]);
        if (!active) return;
        setOrgAnalytics(analytics || null);
        setMembers(memberList || []);
      } catch {
        /* user may not be in an org */
      } finally {
        if (active) setOrgLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isKepala = userRole === 'partner' || userRole === 'platform_admin';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return t('greetingMorning');
    if (h < 15) return t('greetingNoon');
    if (h < 18) return t('greetingAfternoon');
    return t('greetingEvening');
  })();

  if (isKepala && orgAnalytics) {
    return (
      <div className="w-full space-y-6">
        <Reveal>
          <div className="bg-dots relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="inline-block rounded-full bg-crimson/10 px-3 py-1 text-[10px] font-bold tracking-widest text-crimson uppercase">
                  {t('text_107')}</span>
                <h1 className="mt-4 text-3xl font-bold tracking-tighter text-navy md:text-4xl">
                  {greeting}, <span className="text-crimson">{userName.split(' ')[0]}</span>.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                  {t('text_108')}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {t('text_109')}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-navy">99,8%</p>
                <p className="text-[10px] text-muted-foreground">{t('text_110')}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KEPALA_CARDS.map(({ icon: Icon, labelKey, key, color, chip }, i) => (
            <Reveal key={labelKey} delay={i * 0.05}>
              <Card className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${chip} ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {t('realtime')}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground">{t(labelKey)}</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-navy">
                    {orgAnalytics[key]}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {orgAnalytics.pending_approvals > 0 && (
          <Reveal>
            <Card className="flex items-center gap-4 border-amber/30 bg-amber/5 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/15">
                <AlertTriangle className="h-5 w-5 text-amber" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-navy">
                  {orgAnalytics.pending_approvals} {t('text_111')}</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('text_112')}</p>
              </div>
              <Button variant="accent" size="sm">
                {t('text_113')}</Button>
            </Card>
          </Reveal>
        )}

        <Reveal>
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="text-label text-navy">{t('text_114')}</span>
                <h3 className="mt-1 text-lg font-extrabold tracking-tight text-navy">
                  {t('text_115')}</h3>
              </div>
              <Badge variant="default">{members.length} {t('membersActive')}</Badge>
            </div>
            {orgLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t('text_121')}
                hint={t('emptyMembersHint')}
              />
            ) : (
              <div className="space-y-2">
                {members.map((m) => (
                  <motion.div
                    key={m.user_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-all hover:border-navy/20 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                        {(m.user_name || m.user_email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy">{m.user_name || m.user_email}</div>
                        <div className="text-xs text-muted-foreground">{m.user_email}</div>
                      </div>
                    </div>
                    <Badge variant={m.status === 'active' ? 'wellness' : 'secondary'}>
                      {m.status === 'active' ? t('statusActive') : m.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Hero header — light, navy primary */}
      <Reveal>
        <div className="bg-dots relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:px-8 md:py-6 shadow-card">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-crimson/10 px-3 py-1 text-[10px] font-bold tracking-widest text-crimson uppercase">
                {t('text_116')}</span>
              <h1 className="mt-2 text-3xl font-bold tracking-tighter text-navy md:text-4xl">
                {greeting}, <span className="text-crimson">{userName.split(' ')[0]}</span>.
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground md:text-base">
                {t('text_117')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber" />
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {t('text_118')}</span>
              </div>
              <p className="mt-1 text-base font-extrabold text-navy">{t('text_119')}</p>
              <p className="text-[10px] text-muted-foreground">{t('text_120')}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <ProtectionStats summary={summary} />
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Reveal>
            <WeeklyTrendChart />
          </Reveal>
          <Reveal delay={0.05}>
            <PeakHoursChart />
          </Reveal>
        </div>
        <div className="space-y-4">
          <Reveal delay={0.1}>
            <BlockedCategories />
          </Reveal>
          <Reveal delay={0.15}>
            <LastInterventions />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
