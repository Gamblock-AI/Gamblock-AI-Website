'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { BookOpen, Terminal, LifeBuoy, Shield, Check, Clock, Key, Copy, CheckCircle } from 'lucide-react';
import { useTranslations } from "next-intl";

interface EducationModule {
  id: string; slug: string; title: string; summary: string; estimated_minutes: number; status: string;
}
interface ModelRelease {
  id: string; version: string; platform: string; sha256: string; status: string; published_at_text: string;
}
interface SupportCase {
  id: string; title: string; type: string; status: string; priority: string; owner: string;
}

export default function AdminPage() {
    const t = useTranslations('adminPage');
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [releases, setReleases] = useState<ModelRelease[]>([]);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [emergencyKey, setEmergencyKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mod, rel, cas] = await Promise.all([
        apiClient<EducationModule[]>('/admin/content/modules'),
        apiClient<ModelRelease[]>('/admin/model-releases'),
        apiClient<SupportCase[]>('/admin/support-cases'),
      ]);
      setModules(mod || []);
      setReleases(rel || []);
      setCases(cas || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setTimeout(() => fetchAdminData(), 0); }, []);

  const generateKey = async () => {
    setKeyLoading(true);
    try {
      const res = await apiClient<{ emergency_key: string }>('/admin/emergency-key', { method: 'POST' });
      setEmergencyKey(res?.emergency_key || null);
      setKeyCopied(false);
    } catch { /* ignore */ } finally {
      setKeyLoading(false);
    }
  };

  const copyKey = () => {
    if (emergencyKey) {
      navigator.clipboard.writeText(emergencyKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-navy/5 text-navy">
          <Shield className="size-6" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">{t('text_83')}</h1>
          <p className="text-xs font-semibold text-muted-foreground">
            {t('text_84')}</p>
        </div>
      </div>

      <Tabs defaultValue="konten" className="w-full">
        <TabsList className="mb-2 flex w-fit gap-1 rounded-xl border border-border bg-muted/60 p-1">
          <TabsTrigger value="konten" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <BookOpen className="size-4" /> Konten
          </TabsTrigger>
          <TabsTrigger value="releases" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <Terminal className="size-4" /> {t('text_85')}</TabsTrigger>
          <TabsTrigger value="support" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <LifeBuoy className="size-4" /> Tiket
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <Key className="size-4" /> {t('text_86')}</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center gap-1.5 py-12 text-center text-xs font-semibold text-muted-foreground">
            <Clock className="size-4 animate-spin" /> {t('text_87')}</div>
        ) : (
          <>
            <TabsContent value="konten" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-base font-black text-navy">{t('text_88')}</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Judul</TableHead><TableHead>Slug</TableHead><TableHead>Durasi</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody className="text-xs font-semibold">
                  {modules.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-navy">{m.title}</TableCell>
                      <TableCell className="text-muted-foreground">{m.slug}</TableCell>
                      <TableCell>{m.estimated_minutes} mnt</TableCell>
                      <TableCell><Badge variant={m.status === 'published' ? 'default' : 'secondary'}>{m.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="releases" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-base font-black text-navy">{t('text_89')}</h3>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Versi</TableHead><TableHead>Platform</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody className="text-xs font-semibold">
                  {releases.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{r.id}</TableCell>
                      <TableCell className="font-bold text-navy">{r.version}</TableCell>
                      <TableCell>{r.platform}</TableCell>
                      <TableCell><Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status === 'published' ? 'Aktif' : r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="support" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-base font-black text-navy">{t('text_90')}</h3>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Subjek</TableHead><TableHead>Tipe</TableHead><TableHead>Prioritas</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody className="text-xs font-semibold">
                  {cases.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-[10px]">{c.id}</TableCell>
                      <TableCell className="font-bold text-navy">{c.title}</TableCell>
                      <TableCell>{c.type.replace('_', ' ')}</TableCell>
                      <TableCell><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.priority === 'high' ? 'bg-crimson/10 text-crimson' : 'bg-navy/10 text-navy'}`}>{c.priority}</span></TableCell>
                      <TableCell><Badge variant={c.status === 'open' ? 'secondary' : 'default'}>{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Emergency Key Tab */}
            <TabsContent value="emergency" className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-base font-black text-navy">{t('text_91')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('text_92')}</p>

              {emergencyKey ? (
                <Card className="border-amber/30 bg-amber/[0.03] p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-amber" />
                      <span className="text-label text-amber">{t('text_93')}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <code className="flex-1 font-mono text-lg font-bold tracking-widest text-navy select-all">
                        {emergencyKey}
                      </code>
                      <Button variant="ghost" size="sm" onClick={copyKey}>
                        {keyCopied ? <CheckCircle className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
                        {keyCopied ? 'Tersalin' : 'Salin'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {t('text_94')}</div>
                  </div>
                </Card>
              ) : (
                <Button variant="accent" onClick={generateKey} disabled={keyLoading}>
                  {keyLoading ? <Clock className="mr-1.5 h-4 w-4 animate-spin" /> : <Key className="mr-1.5 h-4 w-4" />}
                  {t('text_95')}</Button>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
