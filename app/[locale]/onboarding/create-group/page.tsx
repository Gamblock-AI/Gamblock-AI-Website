'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Users, Copy, CheckCircle, Share2, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/routes';
import { useTranslations } from "next-intl";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const groupSchema = z.object({
  name: z.string().min(4, { message: "Nama grup minimal 4 karakter" }).max(50, { message: "Nama grup maksimal 50 karakter" }),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface OrgResponse {
  id: string;
  name: string;
  group_code: string;
  status: string;
}

export default function CreateGroupPage() {
    const t = useTranslations('create-groupPage');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [org, setOrg] = useState<OrgResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: GroupFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient<OrgResponse>('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: data.name.trim() }),
      });
      setOrg(res);
    } catch {
      setError('Gagal membuat grup. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (org?.group_code) {
      navigator.clipboard.writeText(org.group_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const shareWhatsApp = () => {
    if (!org) return;
    const text = encodeURIComponent(
      `Halo! Saya mengundang Anda bergabung ke grup monitoring Gamblock AI.\n\nNama Grup: ${org.name}\nKode Grup: *${org.group_code}*\n\nMasukkan kode ini di aplikasi Gamblock AI Anda.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage/10">
            <CheckCircle className="h-7 w-7 text-sage" />
          </div>
          <h2 className="text-heading text-xl text-navy">{t('text_272')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('text_273')}</p>

          <div className="mt-6 rounded-xl border-2 border-navy/10 bg-navy/[0.02] p-5">
            <p className="text-label text-muted-foreground">{t('text_274')}</p>
            <p className="mt-2 font-mono text-3xl font-extrabold tracking-[0.15em] text-navy select-all">
              {org.group_code}
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={copyCode}>
              {copied ? <CheckCircle className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'Tersalin' : 'Salin'}
            </Button>
            <Button variant="primary" className="flex-1" onClick={shareWhatsApp}>
              <Share2 className="mr-1.5 h-4 w-4" />
              {t('text_275')}</Button>
          </div>

          <Button
            variant="ghost"
            className="mt-6 w-full"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            {t('text_276')}<ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/10">
            <Users className="h-7 w-7 text-navy" />
          </div>
          <h2 className="text-heading text-2xl text-navy">{t('text_277')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('text_278')}</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-label text-navy">{t('text_279')}</label>
              <p className="text-xs text-muted-foreground">
                {t('text_280')}</p>
              <input
                type="text"
                {...formRegister('name')}
                placeholder={t('text_282')}
                className={`mt-2 w-full rounded-lg border bg-background py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none ${errors.name ? 'border-crimson' : 'border-input'}`}
              />
              {errors.name && <p className="text-xs text-crimson font-medium mt-1">{errors.name.message}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Membuat...' : 'Buat Grup'}
              <Shield className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('text_281')}</p>
        </Card>
      </div>
    </div>
  );
}
