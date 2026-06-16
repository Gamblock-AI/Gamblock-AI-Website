'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Copy, CheckCircle, Share2, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/routes';

interface OrgResponse {
  id: string;
  name: string;
  group_code: string;
  status: string;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [org, setOrg] = useState<OrgResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient<OrgResponse>('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      setOrg(data);
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
          <h2 className="text-heading text-xl text-navy">Grup Berhasil Dibuat!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bagikan kode grup ini ke mahasiswa Anda
          </p>

          <div className="mt-6 rounded-xl border-2 border-navy/10 bg-navy/[0.02] p-5">
            <p className="text-label text-muted-foreground">Kode Grup</p>
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
              Bagikan WA
            </Button>
          </div>

          <Button
            variant="ghost"
            className="mt-6 w-full"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            Lanjut ke Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
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
          <h2 className="text-heading text-2xl text-navy">Buat Grup Monitoring</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sebagai Dosen/Pendamping, buat grup untuk mengawasi mahasiswa Anda.
          </p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-label text-navy">Nama Grup</label>
              <p className="text-xs text-muted-foreground">
                Contoh: &ldquo;Kelas TI-2024A&rdquo; atau &ldquo;Bimbingan Skripsi 2026&rdquo;
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama grup monitoring"
                className="mt-2 w-full rounded-lg border border-input bg-background py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Membuat...' : 'Buat Grup'}
              <Shield className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Kode grup unik akan dibuat secara otomatis. Bagikan kode ini ke mahasiswa melalui WA.
          </p>
        </Card>
      </div>
    </div>
  );
}
