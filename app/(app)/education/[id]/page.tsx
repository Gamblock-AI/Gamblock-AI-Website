'use client';
import { ROUTES } from '@/routes';

import Link from 'next/link';
import { useState, use, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const titles: Record<string, string> = {
  'kesadaran-impulsif': 'Kesadaran Impulsif',
  'pengendalian-diri': 'Pengendalian Diri',
  'regulasi-emosi': 'Regulasi Emosi',
  'bahaya-judi-online': 'Bahaya Judi Online',
  'membangun-kebiasaan-baru': 'Membangun Kebiasaan Baru',
};

const readTimes: Record<string, string> = {
  'kesadaran-impulsif': '4 Menit',
  'pengendalian-diri': '6 Menit',
  'regulasi-emosi': '5 Menit',
  'bahaya-judi-online': '8 Menit',
  'membangun-kebiasaan-baru': '7 Menit',
};

interface ModuleDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_markdown: string;
  estimated_minutes: number;
  progress: number;
  status: string;
}

export default function EducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [completed, setCompleted] = useState(false);
  const [moduleData, setModuleData] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleDetail = async () => {
      try {
        const data = await apiClient<ModuleDetail>(
          `/psychoeducation/modules/${id}`
        );
        setModuleData(data);
        setCompleted(data.progress >= 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      setTimeout(() => {
        fetchModuleDetail();
      }, 0);
    }
  }, [id]);

  const title = moduleData?.title || titles[id] || id;
  const readTime = moduleData?.estimated_minutes
    ? `${moduleData.estimated_minutes} Menit`
    : readTimes[id] || '5 Menit';

  return (
    <div className="w-full space-y-3">
      {/* Back button */}
      <div>
        <Link
          href={ROUTES.EDUCATION}
          className="hover:text-navy group inline-flex items-center gap-3 text-sm font-semibold text-slate-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
          Kembali ke Psikoedukasi
        </Link>
      </div>

      {/* Main content wrapper */}
      <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] md:p-10">
        {/* Module Meta Header */}
        <div className="space-y-3 border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              Modul
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> Est. {readTime} Baca
            </span>
          </div>
          <h1 className="text-navy text-3xl font-black tracking-tight md:text-2xl">
            {title}
          </h1>
        </div>

        {/* Text body */}
        <div className="prose prose-slate max-w-none space-y-3 text-base leading-relaxed text-slate-600">
          <p>
            Modul ini membahas tentang <strong>{title.toLowerCase()}</strong>{' '}
            secara mendalam. Anda akan mempelajari konsep dasar, mekanisme
            psikologis yang mendasari, dan teknik praktis yang dapat segera Anda
            terapkan dalam kehidupan sehari-hari untuk menjaga stabilitas
            regulasi diri.
          </p>

          <h3 className="text-navy pt-2 text-xl font-bold">
            1. Konsep Dasar & Pentingnya Regulasi Diri
          </h3>
          <p>
            Berdasarkan <em>Self-Regulation Theory</em>, kegagalan menolak
            dorongan judi sering kali disebabkan oleh berkurangnya kapasitas
            kontrol kognitif pada momen-momen kritis (misalnya saat lelah,
            cemas, atau di bawah tekanan finansial). Memahami situasi rentan ini
            adalah langkah awal yang sangat penting.
          </p>

          <h3 className="text-navy pt-2 text-xl font-bold">
            2. Langkah Praktis Latihan Mandiri
          </h3>
          <ul className="list-disc space-y-3 pl-6">
            <li>
              <strong>Mengenali Trigger:</strong> Catat emosi yang Anda rasakan
              sebelum keinginan mengakses situs judi muncul (apakah stres,
              bosan, atau kesepian?).
            </li>
            <li>
              <strong>Pattern Interrupt:</strong> Saat dorongan muncul, ambil
              jeda napas dalam-dalam selama 10 detik. Fokuskan pikiran pada
              konsekuensi jangka panjang.
            </li>
            <li>
              <strong>Hubungi Pendamping:</strong> Jangan ragu untuk mengirimkan
              pesan singkat ke pendamping terdaftar Anda untuk meminta bantuan
              pendampingan moral.
            </li>
          </ul>

          <p>
            Membangun kendali diri yang kokoh membutuhkan waktu dan latihan yang
            konsisten. Setiap keberhasilan menolak dorongan impulsif, sekecil
            apa pun, adalah langkah maju menuju pemulihan total.
          </p>
        </div>

        {/* Module Completion Widget */}
        <div className="mt-2 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-2 sm:flex-row">
          <div className="text-center text-sm text-slate-500 sm:text-left">
            {completed ? (
              <span className="flex items-center justify-center gap-1.5 font-semibold text-emerald-600 sm:justify-start">
                <CheckCircle className="size-5" /> Anda telah menyelesaikan
                modul ini!
              </span>
            ) : (
              <span>
                Selesaikan membaca materi di atas untuk mencatat progres Anda.
              </span>
            )}
          </div>

          <button
            onClick={() => setCompleted((prev) => !prev)}
            className={`py-2.5.5 flex cursor-pointer items-center gap-3 rounded-xl px-4 text-xs font-bold shadow-md transition-all ${
              completed
                ? 'bg-slate-100 text-slate-700 shadow-slate-100/50 hover:bg-slate-200'
                : 'bg-navy hover:bg-navy/90 text-white shadow-blue-500/10'
            }`}
          >
            {completed ? (
              <>
                <Check className="size-4" /> Tandai Belum Selesai
              </>
            ) : (
              <>
                <CheckCircle className="size-4" /> Tandai Selesai & Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
