'use client';

import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { Heart, Send, CheckCircle, Clock, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialEntries = [
  { date: '5 Juni 2026', text: 'Hari ini saya berhasil menahan diri dari godaan untuk membuka aplikasi berkat Pattern Interrupt.', mood: 'Baik' },
  { date: '4 Juni 2026', text: 'Merasa cemas di sore hari karena bosan, tapi berhasil mengalihkan perhatian dengan jalan kaki dan membaca modul kesadaran.', mood: 'Cemas' },
  { date: '3 Juni 2026', text: 'Berbicara dengan pendamping terdaftar (Suci) tentang perasaan cemas saya. Rasanya jauh lebih lega.', mood: 'Biasa' },
];

const questions = [
  'Seberapa kuat keinginan mengakses situs judi minggu ini?',
  'Apakah Anda merasa tingkat kendali diri Anda meningkat dibanding minggu lalu?',
  'Apakah Anda menggunakan teknik Pattern Interrupt/pernapasan saat dorongan muncul?',
];

interface BackendReflection {
  id: string;
  text: string;
  mood: string;
  created_at?: string;
}

const moodColors: Record<string, string> = {
  'Baik': 'border-sage/30 bg-sage/5 text-sage',
  'Cemas': 'border-amber/30 bg-amber/5 text-amber',
  'Biasa': 'border-navy/20 bg-navy/5 text-navy',
};

export default function RecoveryPage() {
  const [entries, setEntries] = useState(initialEntries);
  const [newText, setNewText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Biasa');
  const [submittedCheckin, setSubmittedCheckin] = useState(false);
  const [intention, setIntention] = useState('');
  const [motivation, setMotivation] = useState('');
  const [targetDays, setTargetDays] = useState(90);

  useEffect(() => {
    const savedIntention = localStorage.getItem('gamblock_intention');
    const savedMotivation = localStorage.getItem('gamblock_motivation');
    const savedTargetDays = localStorage.getItem('gamblock_target_days');

    const fetchInitial = async () => {
      try {
        const data = await apiClient<BackendReflection[]>('/reflections');
        const mapped = (data || []).map((r) => ({
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '6 Juni 2026',
          text: r.text,
          mood: r.mood,
          id: r.id,
        }));
        setEntries(mapped);
      } catch { /* ignore */ }
    };

    setTimeout(() => {
      setIntention(savedIntention || 'Saya berkomitmen untuk berhenti dari segala bentuk judi online demi menyelesaikan kuliah tepat waktu, menjaga amanah orang tua, dan menyelamatkan masa depan finansial saya.');
      setMotivation(savedMotivation || 'Keluarga, Pendidikan & Kesehatan Mental');
      setTargetDays(savedTargetDays ? Number(savedTargetDays) : 90);
      fetchInitial();
    }, 0);
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      await apiClient('/reflections', { method: 'POST', body: JSON.stringify({ text: newText, mood: selectedMood }) });
      toast.success('Jurnal refleksi berhasil disimpan!');
      setNewText('');
      const data = await apiClient<BackendReflection[]>('/reflections');
      const mapped = (data || []).map((r) => ({
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '6 Juni 2026',
        text: r.text,
        mood: r.mood,
        id: r.id,
      }));
      setEntries(mapped);
    } catch {
      toast.error('Gagal menyimpan jurnal refleksi.');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="border-sage/20 bg-sage/[0.03] p-5">
        <span className="inline-block rounded-full bg-sage/10 px-3 py-1 text-label text-sage">
          Pemulihan & Terapi
        </span>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy">
          Rehabilitasi & Jurnal Refleksi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ungkapkan perasaan Anda, tuangkan refleksi diri harian, dan isi check-in psikologis mingguan.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Journal */}
        <div className="space-y-4 lg:col-span-2">
          {/* New Entry */}
          <Card className="p-5">
            <h3 className="text-sm font-extrabold text-navy">Tulis Jurnal Refleksi</h3>
            <form onSubmit={handleAddEntry} className="mt-3 space-y-3">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Ceritakan bagaimana perasaan Anda hari ini. Apa yang memicu dorongan? Bagaimana Anda mengatasinya?"
                className="min-h-[100px] w-full rounded-xl border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-navy focus:ring-2 focus:ring-navy/15 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {['Baik', 'Biasa', 'Cemas'].map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                        selectedMood === mood
                          ? moodColors[mood] || 'border-navy/30 bg-navy/5 text-navy'
                          : 'border-border text-muted-foreground hover:border-navy/20'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                <Button type="submit" variant="wellness" size="sm">
                  <Send className="h-3.5 w-3.5" />
                  Simpan
                </Button>
              </div>
            </form>
          </Card>

          {/* Journal History */}
          <Card className="p-5">
            <h3 className="text-sm font-extrabold text-navy">Riwayat Refleksi</h3>
            <div className="mt-3 max-h-[500px] space-y-3 overflow-y-auto">
              {entries.map((e, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/30 p-4 transition-all hover:border-navy/15">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {e.date}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${moodColors[e.mood] || 'border-border text-muted-foreground'}`}>
                      {e.mood}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed font-semibold text-foreground">{e.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Check-in & Commitment */}
        <div className="space-y-4">
          {/* Commitment */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <Target className="h-5 w-5 text-crimson" />
              <h3 className="text-sm font-extrabold tracking-wider text-navy uppercase">Komitmen Saya</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs leading-relaxed font-semibold text-muted-foreground italic">
                  &ldquo;{intention}&rdquo;
                </p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="font-medium text-muted-foreground">Motivasi</span>
                  <span className="font-bold text-navy">{motivation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Target Bebas Judi</span>
                  <span className="font-bold text-sage">{targetDays} Hari</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Check-in */}
          <Card className="p-5">
            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-extrabold text-navy">Evaluasi Mingguan</h3>
              <p className="text-xs text-muted-foreground">
                Evaluasi rutin mingguan untuk mengukur kemajuan kemandirian Anda.
              </p>
            </div>
            {submittedCheckin ? (
              <div className="rounded-xl border border-sage/20 bg-sage/5 p-5 text-center">
                <CheckCircle className="mx-auto h-9 w-9 text-sage" />
                <p className="mt-2 text-xs font-bold text-sage">Laporan Mingguan Disimpan!</p>
                <p className="mt-1 text-[11px] text-sage/70">
                  Data evaluasi psikologis Anda berhasil dikompilasi untuk memetakan progres jangka panjang.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-xs leading-snug font-bold text-foreground">{q}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Rendah', 'Sedang', 'Tinggi'].map((opt) => (
                        <label
                          key={opt}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-navy/30 hover:bg-navy/5"
                        >
                          <input type="radio" name={`q${i}`} className="text-navy accent-navy" required />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setSubmittedCheckin(true); toast.success('Evaluasi mingguan berhasil dikirim!'); }}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-[0.98] hover:bg-navy-light"
                >
                  Kirim Evaluasi <CheckCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
