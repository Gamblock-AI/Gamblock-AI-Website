# Website AI Context


`AGENTS.md` adalah file instruksi kanonik. File provider-specific hanya
menunjuk ke sumber bersama. `manifest.yaml` adalah inventori machine-checkable.

Jika ada pertentangan dengan `pkm_proposal.md`, proposal PKM adalah sumber mutlak.

## Product capsule

Website adalah permukaan psychoeducation, self-regulation, accountability, dan
public education. Core: post-block psychoeducation, intention, impulse-awareness, mood tracking,
daily missions, skill recommendations, self-regulation review loop.

## Hard boundaries

- Tidak menerima URL, domain, DOM, browsing history
- Pattern Interrupt dirender oleh client, bukan website
- Tidak mengekspos raw recovery text ke partner/admin
- Tidak ada browsing context di parameter URL, analytics, atau error reporting

## Current capability truth

| Area | State | Evidence/limit |
|---|---|---|
| Dashboard (student/partner/admin) | implemented | Per-role surface terpisah di `/dashboard`. Student: sapaan, strip ringkasan (check-in minggu, blokir proteksi, hari aktif, streak), langkah edukasi selanjutnya, bantuan darurat, **chart tren blokir proteksi 7 hari** (dari `/client/progress?days=7`), ringkasan proteksi, FAB misi harian |
| Role analytics | implemented | Partner dan admin mendapat panel analitik agregat di dashboard: trend kunjungan situs judi harian (14/30 hari), jam rawan (histogram 24 jam dari `metadata_json.hourly`), counter intervensi/tamper/izin dicabut, coverage sharing (partner) dan jumlah pengguna terlindungi (admin). Data hanya agregat; chart SVG custom tanpa library eksternal. Sumber: `GET /v1/accountability/analytics` (partner, hormati consent sharing) dan `GET /v1/admin/analytics` (admin) via `hooks/use-analytics.ts` |
| Mood/urge check-in | implemented | Check-in harian (mood 1–5, urge 0–5) digabung ke modal "Niat Perubahan" (`NiatPerubahanModal`) sebagai step dinamis: keduanya muncul → 4 step (Refleksi, Niat, Check-in, Konfirmasi; check-in di step 3); hanya niat → 3 step; hanya check-in → 1 step. Step check-in hanya mengumpulkan mood/urge (`CheckInFields`); simpan dilakukan bersamaan di step Konfirmasi (intention `POST /intentions` + check-in `recordDailyCheckIn`) atau langsung di step tunggal untuk kasus check-in saja. Flag step di-snapshot saat mount agar jumlah step stabil sepanjang alur. Penilaian "sudah check-in hari ini" memakai merge server-authoritative dari `GET /v1/check-ins`; follow-up Gami di step check-in tanpa link aksi (mencegah keluar dari wizard). Gate check-in terpisah (`StudentDailyCheckInGate`/`StudentCheckInGate`/`PrivateCheckIn`) dihapus |
| Daily missions | implemented | 4 slot default `Asia/Jakarta` (proteksi aktif, check-in, seksi edukasi, modul edukasi), 10 EXP/slot, custom missions |
| Learning Hub / skills | implemented | Katalog UTY 22 program, 5 cluster, progress account-scoped; "Pilih arah belajar" = grid kartu layanan berlogo (provider dicari dari katalog) dengan deskripsi singkat per layanan (`provider_description` dari document item) → `/skills/[providerSlug]` daftar kursus dengan thumbnail; pagination 9 kartu/halaman di `/skills` dan `/skills/[providerSlug]`; search di `/skills` memakai query param URL `?q=`, turut mencocokkan deskripsi, dan mereset halaman; section latihan singkat dihapus |
| Intention + weekly review | implemented | Intention manager local-first, weekly review terenkripsi |
| Psychoeducation | implemented | Dokumen bilingual berversi, progress per-revision; search di `/education` memakai query param URL `?q=` dengan debounce (state lokal agar ketikan cepat tidak kehilangan karakter) |
| Post-intervention handoff | implemented | `/post-intervention` tanpa browsing context |
| Accountability | implemented | Group/partner lifecycle, removal approval, aggregate dashboard |
| Recovery/Pemulihan | implemented | `/recovery` = hub Pemulihan (sebelumnya `/progress`; `/progress` redirect ke `/recovery`): weekly review, recap aktivitas 7/30/90, evaluasi; untuk user & partner (data siswa tetap privat). Tab rentang memakai query param `?range=7|30|90` dengan default 7 hari (visiting `/recovery` di-redirect ke `?range=7`, meniru pola `/support?channel=...`). Journal terenkripsi di `/journal`. Kalender pemulihan mencatat kategori check-in, jurnal, misi, edukasi, tinjauan, learning-hub/keterampilan, dan proteksi (blokir harian); sel kalender menampilkan ikon per kategori; "Detail hari" tampil sebagai modal. Card estimator "Yang kamu jaga" dan card "Tinjauan mingguan" dihapus dari aside (aksi weekly review & recap dipindah ke header). Room 2.5D beserta praktik timer (urge-surfing/grounding/focus) dihapus; misi harian `recovery_practice_today` dihapus |
| Support workspace | implemented | Encrypted threaded support, requester + admin queue |
| Account recovery | implemented | Non-enumerating email code, 12-character single-use |
| PKM transparency | implemented | `/pkm` route dengan evidence maturity, deliverables state |
| Admin control plane | implemented | Content CMS, releases, tickets, emergency, platform |
| Onboarding | implemented | Registration/login, partner invitation |
| Dashboard tour | implemented (supporting) | First-time guided tour di dashboard untuk role `user`: konten dashboard, group sidebar, kontrol navbar; sekali muncul, bisa di-skip, flag localStorage `gamblock:dashboard-tour:v1`, variant mobile (bottom nav) |
| PWA & daily reminder | implemented (supporting) | Installable PWA (manifest + service worker + Web Push); opt-in daily reminder di Settings, sinkron via `/v1/me/reminder-preference`; push dibuka ke `/{locale}/recovery` |
| Data export/deletion | implemented | AES-256-GCM encrypted export ZIP, self-service deletion |

Context version: `2026-08-09.5`

## Context load order

1. Baca `AGENTS.md` untuk invariants, arsitektur, paths, verifikasi
2. Baca file ini untuk status implementasi
3. Inspeksi implementasi dan test sebelum mengedit

## Task-specific context

- Routes/locale/auth: `app/[locale]/`, `routes.ts`, `proxy.ts`
- API data: `lib/api-client.ts`, `lib/config.ts`, `hooks/use-*.ts`
- Dashboard/recovery UI: `app/[locale]/(dashboard)/`, `components/dashboard/`
- Accountability: group codes hashed/rotatable, approval dari backend membership
- Post-intervention: `app/[locale]/(landing)/post-intervention/` — tanpa browsing context
- Psychoeducation: education routes, `hooks/use-education.ts`
- Landing UI: `app/[locale]/(landing)/`, `components/landing/`
- Messages/feedback: `lib/messages.ts`, `lib/feedback.ts`
- AI-context maintenance: semua file di `manifest.yaml`

## Default AI validation

```sh
npm run lint -- <changed-source-files>
npm run verify:ai-context  # jika context berubah
```

Test, build, E2E hanya dijalankan jika user meminta eksplisit.

## Context maintenance

1. Update `AGENTS.md` jika aturan, path, atau command berubah
2. Provider adapters tetap tipis
3. Bump `context_version` di `AGENTS.md`, file ini, dan `manifest.yaml`
4. Update `README.md` jika onboarding developer berubah
5. Jalankan context verifier dan lint
