'use client';
import { ROUTES } from '@/routes';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function PartnerInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient(`/partners/invitations/${token}/accept`, {
        method: 'POST',
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        'Gagal menerima undangan. Pastikan Anda telah masuk (login) sebagai Akun Pendamping terlebih dahulu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-navy relative flex min-h-screen flex-col justify-between overflow-hidden p-6 md:p-12">
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -bottom-20 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-3xl" />
      </div>

      {/* Top Branding Header */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-navy flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-white shadow-md">
            G
          </div>
          <span className="text-navy text-lg font-extrabold tracking-tight">
            Gamblock AI
          </span>
        </div>
        <button
          onClick={() => router.push(ROUTES.LOGIN)}
          className="text-navy cursor-pointer text-xs font-bold hover:underline"
        >
          Masuk Sebagai Pendamping
        </button>
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 mx-auto my-auto w-full max-w-md space-y-6 rounded-[40px] border border-slate-100 bg-white p-8 text-center shadow-[0_15px_50px_rgba(27,43,94,0.04)] md:p-10">
        <div className="text-navy mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-50 shadow-sm">
          <Users className="size-8" />
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle className="size-6" />
            </div>
            <h2 className="text-navy text-2xl font-black tracking-tight">
              Undangan Diterima!
            </h2>
            <p className="text-xs leading-relaxed font-semibold text-slate-500">
              Anda sekarang resmi terdaftar sebagai **Pendamping
              Akuntabilitas**. Anda akan menerima notifikasi jika pengguna
              terproteksi meminta izin penonaktifan atau pause proteksi.
            </p>
            <button
              onClick={() => router.push(ROUTES.PARTNERS)}
              className="bg-navy hover:bg-navy/90 mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl py-4 text-xs font-bold text-white shadow-md transition-all"
            >
              Buka Portal Mitra <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-crimson rounded-full bg-red-50 px-3 py-1 text-[10px] font-black tracking-wider uppercase">
                Protokol Akuntabilitas Sosial
              </span>
              <h2 className="text-navy pt-2 text-2xl font-black tracking-tight">
                Undangan Pendamping
              </h2>
              <p className="text-xs leading-relaxed font-semibold text-slate-500">
                Anda diundang untuk menjadi pendamping akuntabilitas pemulihan
                judi online. Tugas Anda adalah membantu memantau dan memberikan
                persetujuan saat diperlukan.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-xs font-semibold text-red-700">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={loading}
              className="bg-crimson hover:bg-crimson/90 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl py-4 text-xs font-bold text-white shadow-md shadow-red-500/10 transition-all disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Terima Undangan & Mulai Lindungi'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 text-center text-xs text-slate-400">
        © 2026 Gamblock AI. Program Akuntabilitas Sosial.
      </div>
    </div>
  );
}
