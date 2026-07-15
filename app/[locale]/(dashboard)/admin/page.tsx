'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Terminal, LifeBuoy, Shield, Clock, Key, Copy, CheckCircle, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toastError, toastSuccess } from '@/lib/feedback';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { apiClient } from '@/lib/api-client';

export default function AdminPage() {
  const t = useTranslations('adminPage');
  const {
    modules, releases, cases, loading, refetch,
    emergencyKey, keyLoading, generateEmergencyKey,
  } = useAdminOperations();
  const [keyCopied, setKeyCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateKey = async () => {
    try {
      await generateEmergencyKey();
      setKeyCopied(false);
    } catch (error) {
      toastError(error, t('keyError'));
    }
  };

  const copyKey = () => {
    if (emergencyKey) {
      navigator.clipboard.writeText(emergencyKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };

  const createDummyModule = async () => {
    setIsSubmitting(true);
    try {
      await apiClient('/admin/content/modules', {
        method: 'POST',
        body: JSON.stringify({
          title: `New Module ${Date.now()}`,
          slug: `new-module-${Date.now()}`,
          summary: "A new auto-generated module for recovery",
          estimated_minutes: 5,
          status: "published",
        })
      });
      toastSuccess("Module created successfully");
      await refetch();
    } catch (err) {
      toastError(err, "Failed to create module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDummyRelease = async () => {
    setIsSubmitting(true);
    try {
      await apiClient('/releases/model', {
        method: 'POST',
        body: JSON.stringify({
          platform: "all",
          version: `artifact-v0.${Date.now() % 100}.0`,
          artifact_path: "artifacts/model/new.onnx",
          sha256: "dummyhash",
        })
      });
      toastSuccess("Model release created successfully");
      await refetch();
    } catch (err) {
      toastError(err, "Failed to create model release");
    } finally {
      setIsSubmitting(false);
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

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-2 flex w-fit gap-1 rounded-xl border border-border bg-muted/60 p-1">
          <TabsTrigger value="content" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <BookOpen className="size-4" /> {t('tabContent')}
          </TabsTrigger>
          <TabsTrigger value="releases" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <Terminal className="size-4" /> {t('text_85')}</TabsTrigger>
          <TabsTrigger value="support" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <LifeBuoy className="size-4" /> {t('tabTickets')}
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
            <Key className="size-4" /> {t('text_86')}</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center gap-1.5 py-12 text-center text-xs font-semibold text-muted-foreground">
            <Clock className="size-4 animate-spin" /> {t('text_87')}</div>
        ) : (
          <>
            <TabsContent value="content" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-navy">{t('text_88')}</h3>
                <Button size="sm" onClick={createDummyModule} disabled={isSubmitting}>
                  <Plus className="mr-1.5 size-4" /> New Module
                </Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>{t('thTitle')}</TableHead><TableHead>{t('thSlug')}</TableHead><TableHead>{t('thDuration')}</TableHead><TableHead>{t('thStatus')}</TableHead></TableRow></TableHeader>
                <TableBody className="text-xs font-semibold">
                  {modules.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-navy">{m.title}</TableCell>
                      <TableCell className="text-muted-foreground">{m.slug}</TableCell>
                      <TableCell>{m.estimated_minutes} {t('minutesSuffix')}</TableCell>
                      <TableCell><Badge variant={m.status === 'published' ? 'default' : 'secondary'}>{m.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="releases" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-navy">{t('text_89')}</h3>
                <Button size="sm" onClick={createDummyRelease} disabled={isSubmitting}>
                  <Plus className="mr-1.5 size-4" /> Release Model
                </Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>{t('thVersion')}</TableHead><TableHead>Platform</TableHead><TableHead>{t('thStatus')}</TableHead></TableRow></TableHeader>
                <TableBody className="text-xs font-semibold">
                  {releases.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{r.id}</TableCell>
                      <TableCell className="font-bold text-navy">{r.version}</TableCell>
                      <TableCell>{r.platform}</TableCell>
                      <TableCell><Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status === 'published' ? t('statusActive') : r.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="support" className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-base font-black text-navy">{t('text_90')}</h3>
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>{t('thSubject')}</TableHead><TableHead>{t('thType')}</TableHead><TableHead>{t('thPriority')}</TableHead><TableHead>{t('thStatus')}</TableHead></TableRow></TableHeader>
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
                        {keyCopied ? t('copied') : t('copy')}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {t('text_94')}</div>
                  </div>
                </Card>
              ) : (
                <Button variant="accent" onClick={handleGenerateKey} disabled={keyLoading}>
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
