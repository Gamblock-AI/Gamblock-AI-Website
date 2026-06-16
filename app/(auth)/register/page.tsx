'use client';

import { ROUTES } from '@/routes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, User, Users, Shield } from 'lucide-react';
import { register } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; role: string };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'partner'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = (await register(email, password, name)) as AuthResponse;
      if (res?.access_token) {
        localStorage.setItem('gamblock_access_token', res.access_token);
        localStorage.setItem('gamblock_refresh_token', res.refresh_token);
        document.cookie = `gamblock_access_token=${res.access_token}; path=/; max-age=${res.expires_in || 3600}; SameSite=Lax`;
        localStorage.setItem('gamblock_user', JSON.stringify({ ...res.user, role }));
        if (role === 'partner') {
          router.push(ROUTES.CREATE_GROUP);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      } else {
        setError('Format respon pendaftaran tidak valid.');
      }
    } catch {
      setError('Pendaftaran gagal. Email mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href={ROUTES.HOME} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 space-y-3">
            <Image src="/images/logo.jpg" alt="Gamblock AI" width={40} height={40} className="rounded-xl" />
            <h2 className="text-heading text-2xl text-navy">Mulai pulihkan diri Anda</h2>
            <p className="text-sm text-muted-foreground">
              Buat akun untuk mengaktifkan sistem proteksi dan modul edukasi.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-6 space-y-2">
            <label className="text-label text-navy">Saya mendaftar sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === 'user'
                    ? 'border-navy/30 bg-navy/5 text-navy'
                    : 'border-border text-muted-foreground hover:border-navy/20'
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-xs font-bold">Mahasiswa</span>
                <span className="text-[10px] text-muted-foreground">Member</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('partner')}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  role === 'partner'
                    ? 'border-navy/30 bg-navy/5 text-navy'
                    : 'border-border text-muted-foreground hover:border-navy/20'
                }`}
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs font-bold">Dosen / Pendamping</span>
                <span className="text-[10px] text-muted-foreground">Kepala</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-label text-navy">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label text-navy">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label text-navy">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-0.5 h-4 w-4 rounded border-input accent-navy" required />
              <label htmlFor="terms" className="text-xs leading-relaxed font-medium text-muted-foreground">
                Saya menyetujui{' '}
                <Link href="#" className="font-semibold text-navy hover:underline">Ketentuan Layanan</Link>
                {' '}dan{' '}
                <Link href="#" className="font-semibold text-navy hover:underline">Kebijakan Privasi</Link>
                {' '}Gamblock AI.
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : role === 'partner' ? 'Buat Akun & Lanjutkan ke Grup' : 'Buat Akun Sekarang'}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah memiliki akun?{' '}
            <Link href={ROUTES.LOGIN} className="font-bold text-crimson hover:underline">Masuk di sini</Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          © 2026 Gamblock AI. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
