'use client';

import { ROUTES } from '@/routes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; role: string };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = (await login(email, password)) as AuthResponse;
      if (res?.access_token) {
        localStorage.setItem('gamblock_access_token', res.access_token);
        localStorage.setItem('gamblock_refresh_token', res.refresh_token);
        document.cookie = `gamblock_access_token=${res.access_token}; path=/; max-age=${res.expires_in || 3600}; SameSite=Lax`;
        localStorage.setItem('gamblock_user', JSON.stringify(res.user));
        router.push(ROUTES.DASHBOARD);
      } else {
        setError('Respon server tidak valid.');
      }
    } catch {
      setError('Login gagal. Email tidak ditemukan atau server offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href={ROUTES.HOME}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 space-y-3">
            <Image
              src="/images/logo.jpg"
              alt="Gamblock AI"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <h2 className="text-heading text-2xl text-navy">
              Selamat datang kembali
            </h2>
            <p className="text-sm text-muted-foreground">
              Silakan masuk ke akun Anda untuk memantau progres pemulihan.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-xs font-semibold text-crimson">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-label text-navy">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-label text-navy">Kata Sandi</label>
                <Link href="#" className="text-xs font-semibold text-crimson hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi Anda"
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum memiliki akun?{' '}
            <Link href={ROUTES.REGISTER} className="font-bold text-crimson hover:underline">
              Daftar sekarang gratis
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          © 2026 Gamblock AI. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
