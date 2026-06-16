'use client';

import { useDashboardData } from '@/hooks/use-dashboard-data';
import { ProtectionStats } from './ProtectionStats';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { PeakHoursChart } from './PeakHoursChart';
import { BlockedCategories } from './BlockedCategories';
import { LastInterventions } from './LastInterventions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, TrendingUp, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

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

export default function DashboardPage() {
  const { summary } = useDashboardData();
  const [userRole, setUserRole] = useState<string>('user');
  const [orgAnalytics, setOrgAnalytics] = useState<OrgAnalytics | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gamblock_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUserRole(u.role || 'user');
      } catch { /* */ }
    }

    // Fetch organization data for Kepala
    const fetchOrgData = async () => {
      setOrgLoading(true);
      try {
        const orgData = await apiClient<{ id: string }>('/organizations/mine');
        if (orgData?.id) {
          const [analytics, memberList] = await Promise.all([
            apiClient<OrgAnalytics>(`/organizations/${orgData.id}/analytics`),
            apiClient<OrgMember[]>(`/organizations/${orgData.id}/members`),
          ]);
          setOrgAnalytics(analytics || null);
          setMembers(memberList || []);
        }
      } catch { /* user may not be in an org */ } finally {
        setOrgLoading(false);
      }
    };

    setTimeout(() => fetchOrgData(), 100);
  }, []);

  const isKepala = userRole === 'partner' || userRole === 'platform_admin';

  // ===== KEPALA VIEW =====
  if (isKepala && orgAnalytics) {
    return (
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-navy">Dashboard Pengawasan Grup</h1>
          <p className="text-sm text-muted-foreground">
            Pantau aktivitas dan progres pemulihan seluruh Member.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: 'Total Member', value: orgAnalytics.total_members, color: 'text-navy' },
            { icon: Shield, label: 'Perangkat Aktif', value: orgAnalytics.active_devices, color: 'text-sage' },
            { icon: Activity, label: 'Total Blokir', value: orgAnalytics.total_blocks, color: 'text-crimson' },
            { icon: CheckCircle, label: 'Misi Selesai', value: orgAnalytics.completed_missions, color: 'text-amber' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-navy">{value}</div>
                <div className="text-xs font-semibold text-muted-foreground">{label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Approvals Alert */}
        {orgAnalytics.pending_approvals > 0 && (
          <Card className="flex items-center gap-3 border-amber/30 bg-amber/[0.03] p-4">
            <AlertTriangle className="h-5 w-5 text-amber" />
            <div className="flex-1">
              <span className="text-sm font-bold text-navy">{orgAnalytics.pending_approvals} Permohonan Menunggu</span>
              <p className="text-xs text-muted-foreground">Ada permohonan pencopotan yang perlu persetujuan Anda.</p>
            </div>
            <Button variant="accent" size="sm">Tinjau</Button>
          </Card>
        )}

        {/* Member List */}
        <Card className="p-5">
          <h3 className="text-sm font-extrabold text-navy mb-4">Daftar Member</h3>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                    {m.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy">{m.user_name || m.user_email}</div>
                    <div className="text-xs text-muted-foreground">{m.user_email}</div>
                  </div>
                </div>
                <Badge variant={m.status === 'active' ? 'wellness' : 'secondary'}>
                  {m.status === 'active' ? 'Aktif' : m.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ===== MEMBER VIEW (existing) =====
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold text-navy">Analitik Perlindungan</h1>
        <p className="text-sm text-muted-foreground">
          Tinjauan efektivitas sistem dan tren upaya akses.
        </p>
      </div>

      <ProtectionStats summary={summary} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <WeeklyTrendChart />
          <PeakHoursChart />
        </div>
        <div className="space-y-4">
          <BlockedCategories />
          <LastInterventions />
        </div>
      </div>
    </div>
  );
}
