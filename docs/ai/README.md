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
| Dashboard (student/partner/admin) | implemented | Per-role surface terpisah di `/dashboard`. Student: sapaan, strip ringkasan (check-in minggu, blokir proteksi, hari aktif, streak), langkah edukasi selanjutnya, bantuan darurat, **chart tren blokir proteksi 7 hari** (dari `/client/progress?days=7`), ringkasan proteksi, FAB misi harian, dan **percakapan rekomendasi harian Gami** dari sisi kanan (`GamiDailyRecommendation`). Gami otomatis menyapa sekali per `recommendation_id` dari `GET /v1/client/spk-recommendation`, lalu launcher tetap tersedia untuk membuka ulang langsung ke rekomendasi. Tampilan utama memuat nama fitur, headline LLM bila aktif, dan CTA; disclosure **"Alasan rekomendasi"** mempertahankan chip `Kebutuhan dukungan`/`Aktivitas pemulihan`, penjelasan LLM atau `reason.code`, faktor, pola jam rawan, status data, `data_gaps`, serta refetch. State loading/error awal tidak menginterupsi dashboard; `recommendation_enabled=false` tidak auto-open dan launcher membuka catatan privasi + `/settings`. Urutan overlay mahasiswa dikunci **Niat Perubahan → dashboard tour → Gami**, sehingga spotlight tidak bertumpuk. Sapaan otomatis terakhir disimpan lokal pada `gamblock:gami-recommendation:last-seen-id:v1`; tidak ada data rekomendasi tambahan yang dipersist. Endpoint `POST /v1/client/spk-interventions/:id/complete` tetap hanya kontrak backend untuk auto-complete masa depan. |
| Role analytics | implemented | Partner dan admin mendapat panel analitik agregat di dashboard: trend kunjungan situs judi harian (14/30 hari), jam rawan (histogram 24 jam dari `metadata_json.hourly`), counter intervensi/tamper/izin dicabut, coverage sharing (partner) dan jumlah pengguna terlindungi (admin). Periode analitik (`14`/`30`) tersimpan pada query `period` dan reactive terhadap navigasi browser. Hook analytics melakukan refresh saat window kembali fokus dan setiap 15 detik agar snapshot block hari berjalan yang baru tersinkron segera terlihat. Data hanya agregat; chart SVG custom tanpa library eksternal. Sumber: `GET /v1/accountability/analytics` (partner, hormati consent sharing) dan `GET /v1/admin/analytics` (admin) via `hooks/use-analytics.ts` |
| Mood/urge check-in | implemented | Check-in harian (mood 1–5, urge 0–5) digabung ke modal "Niat Perubahan" (`NiatPerubahanModal`) sebagai step dinamis: keduanya muncul → 4 step (Refleksi, Niat, Check-in, Konfirmasi; check-in di step 3); hanya niat → 3 step; hanya check-in → 1 step. Step check-in hanya mengumpulkan mood/urge (`CheckInFields`); simpan dilakukan bersamaan di step Konfirmasi (intention `POST /intentions` + check-in `recordDailyCheckIn`) atau langsung di step tunggal untuk kasus check-in saja. Flag step di-snapshot saat mount agar jumlah step stabil sepanjang alur. Penilaian "sudah check-in hari ini" memakai merge server-authoritative dari `GET /v1/check-ins`; follow-up Gami di step check-in tanpa link aksi (mencegah keluar dari wizard). Store recovery lokal di-scope per akun (`gamblock:recovery:v1:<accountId>` via `recoveryStorageKeyFor`), jadi akun baru tidak mewarisi check-in/intention akun sebelumnya saat berganti login di browser yang sama; `refreshRecoveryAccount` di-`useRecoverySync` men-scope ulang saat user berubah. Gate check-in terpisah (`StudentDailyCheckInGate`/`StudentCheckInGate`/`PrivateCheckIn`) dihapus |
| Daily missions | implemented | 4 slot default `Asia/Jakarta` (proteksi aktif, check-in, seksi edukasi, modul edukasi), 10 EXP/slot, custom missions |
| Learning Hub / skills | implemented | Katalog UTY 22 program, 5 cluster, progress account-scoped; "Pilih arah belajar" = grid kartu layanan berlogo (provider dicari dari katalog) dengan deskripsi singkat per layanan (`provider_description` dari document item) → `/skills/[providerSlug]` daftar kursus dengan thumbnail; pagination server-side 9 kartu/halaman di `/skills` dan `/skills/[providerSlug]`; search di `/skills` memakai `filter.skillsProviders.q` melalui reusable query-filter hook dengan debounce 350 ms dan mereset `page.skillsProviders`; section latihan singkat dihapus |
| Student mini-games | implemented (supporting) | `/mini-games` dan empat subroute hanya untuk role `user`: Spektrum Kilat (warna-kata), Rakit Rupa (puzzle swap dengan enam gambar dan pilihan 3×3/4×4/5×5), Jejak Kembar (memory pair buah dengan pilihan 4×4/5×5, preview awal 3 detik, dan slot tengah kosong pada papan 5×5), serta Puncak Pikir (trivia bilingual). Semua gameplay session-only di client; tidak ada persistence, backend/API, analytics, SPK/LLM, EXP, leaderboard, partner/admin projection, atau klaim klinis. UI tetap keyboard-operable, memakai aset gambar buah untuk kartu memory, dan menghormati reduced motion. |
| Intention + weekly review | implemented | Intention manager local-first, weekly review terenkripsi |
| Psychoeducation | implemented | Dokumen bilingual berversi, progress per-revision; search di `/education` memakai `filter.education.q` melalui reusable query-filter hook dengan debounce 350 ms dan mereset `page.education` |
| Post-intervention handoff | implemented | `/post-intervention` tanpa browsing context |
| Accountability | implemented | Group/partner lifecycle, removal approval, aggregate dashboard; all paginated queues/lists use server-side `PaginatedList` responses and namespaced URL keys through reusable `usePagination`/`usePaginatedQuery` hooks. Dashboard filters use `filter.resource.field`, and independent lists use `page.resource` (or a resource-scoped equivalent) so pagination never collides. |
| Recovery/Pemulihan | implemented | `/recovery` = hub Pemulihan (sebelumnya `/progress`; `/progress` redirect ke `/recovery`): weekly review, recap aktivitas 7/30/90, evaluasi; untuk user & partner (data siswa tetap privat). Tab rentang memakai query param namespaced `tab.recovery=7|30|90` dengan default 7 hari. Journal terenkripsi di `/journal`. Kalender pemulihan mencatat kategori check-in, jurnal, misi, edukasi, tinjauan, learning-hub/keterampilan, dan proteksi (blokir harian); sel kalender menampilkan ikon per kategori; "Detail hari" tampil sebagai modal. Card estimator "Yang kamu jaga" dan card "Tinjauan mingguan" dihapus dari aside (aksi weekly review & recap dipindah ke header). Room 2.5D beserta praktik timer (urge-surfing/grounding/focus) dihapus; misi harian `recovery_practice_today` dihapus |
| Support workspace | implemented | Encrypted threaded support, requester + admin queue. Channel selector memakai `tab.support=partner|team|hotline`; history filters memakai `filter.supportHistory.field`; state tab dan pagination list yang dimiliki dipertahankan melalui reusable `hooks/use-query-tab.ts`, `useQueryFilters`, `useQueryFilterInput`, dan `usePaginatedQuery`. URL lama dengan kurung siku dinormalisasi ke format titik. |
| Admin tabs | implemented | Ticket, data-request, emergency, dan Learning Hub selectors memakai query key namespaced (`tab.adminTickets`, `tab.adminDataRequests`, `tab.adminEmergency`, `tab.adminLearningHub`) agar tidak bentrok pada navigasi atau pagination. Admin filters memakai `filter.resource.field`, sementara editor state memakai `lang.resource` dan `item.resource`. |
| Account recovery | implemented | Non-enumerating email code, 12-character single-use |
| PKM transparency | implemented | `/pkm` route dengan evidence maturity, deliverables state |
| Admin control plane | implemented | Content CMS, tickets, emergency, platform |
| Onboarding | implemented | Registration/login, partner invitation. Registrasi kini tidak auto-login: setelah submit, OTP 6 digit dikirim via WhatsApp (Fonnte) dan user diarahkan ke `/verify-phone` (`verifyPhonePage`) untuk memasukkan kode; token verifikasi disimpan di `sessionStorage` (`lib/auth.ts` `beginVerificationFlow`), verifikasi memakai endpoint publik `POST /v1/auth/phone-verification/verify` (+ `/verify/resend`), lalu setelah berhasil diarahkan ke halaman login untuk login manual. `Login`/first-password-change pada akun yang `phone_verified_at`-nya kosong juga mengarahkan ke `/verify-phone` (backend mengembalikan `verification_required` + `verification_token`, bukan token sesi). Namun alur login-origin berbeda: `beginVerificationFlow` mencatat `origin: 'login'` (beserta `next` bila ada), verify yang sukses mengembalikan token sesi baru, lalu halaman mempersistensikan sesi dan mengarahkan langsung ke dashboard/`next` tanpa kembali ke halaman login. Alur register-origin (`origin: 'register'`) tetap diarahkan ke halaman login. |
| Dashboard tour | implemented (supporting) | First-time guided tour di dashboard untuk role `user`, `partner`, dan `admin`: konten dashboard, group sidebar, kontrol navbar; sekali muncul, bisa di-skip, flag localStorage `gamblock:dashboard-tour:v1` / `gamblock:partner-tour:v1` / `gamblock:admin-tour:v1`, variant mobile (bottom nav) |
| PWA & daily reminder | implemented (supporting) | Installable PWA (manifest + service worker + Web Push); opt-in daily reminder di Settings, sinkron via `/v1/me/reminder-preference`; push dibuka ke `/{locale}/recovery` |
| SPK privacy settings | implemented | `SpkPrivacySettings` di halaman `/settings` (role `user`): panel 5 toggle privasi SPK/AI (master rekomendasi, data perlindungan, aktivitas pemulihan, konteks pribadi, personalisasi AI) dengan state dirty + Batal/Simpan, sinkron via `GET/PUT /v1/client/spk-preference`; badge menghitung hanya 5 flag (bukan field metadata API); saat master mati sub-kategori nonaktif/didim sebagai kill-switch dengan catatan penjelas + tooltip agar jelas bukan bug; copy menegaskan toggle mengatur penggunaan, bukan penyimpanan data |
| Data export/deletion | implemented | AES-256-GCM encrypted export ZIP, self-service deletion |
| Profile avatar | implemented | The student Profile page opens an on-demand avatar action dialog from the profile image itself. Users can choose, crop, zoom, rotate 90°, upload, or confirm removal through the existing authenticated `/v1/me/avatar` contract; client output is a 512×512 WebP and no browsing data is involved. |

Context version: `2026-09-03.2`

### Dashboard URL query contract

Browser state for dashboard navigation is namespaced and managed through
reusable hooks. Tabs use `tab.resource`, filters use
`filter.resource.field`, editor state uses `lang.resource` or
`item.resource`, and independent server paginators use `page.resource` or a
resource-scoped equivalent. Search inputs use `useQueryFilterInput` with a
350 ms debounce; select filters update immediately. These browser keys are
distinct from backend API parameters such as `page`, `limit`, `q`, and
`group_id`, which remain unchanged at the API boundary. Legacy bracketed
namespaced keys are canonicalized to dot notation, while legacy flat browser
keys are removed rather than dual-read.

## Context load order

1. Baca `AGENTS.md` untuk invariants, arsitektur, paths, verifikasi
2. Baca file ini untuk status implementasi
3. Inspeksi implementasi dan test sebelum mengedit

## Task-specific context

- Routes/locale/auth: `app/[locale]/`, `routes.ts`, `proxy.ts` — `routes.ts`
  adalah single source of truth untuk seluruh rute aplikasi (`ROUTES.*`); selalu
  gunakan konstanta `ROUTES.*` untuk navigasi internal, redirects, `<Link>`, dan
  route matching; jangan pernah hardcode raw route strings; daftarkan rute/subrute baru di `routes.ts`
- API data: `lib/api-client.ts`, `lib/config.ts`, `hooks/use-*.ts`
- Dashboard/recovery UI: `app/[locale]/(dashboard)/`, `components/dashboard/`
- Student mini-games: `app/[locale]/(dashboard)/mini-games/`,
  `components/mini-games/`, `lib/mini-games/`
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

## Cross-repository testing

Runtime and cross-repository evaluation evidence is owned by the public
[Gamblock-AI-Testing repository](https://github.com/Gamblock-AI/Gamblock-AI-Testing).
This website snapshot records implementation status only; it must not duplicate
the canonical testing summary. When an explicit website test is requested for
project evidence, the agent must synchronize `next/report.md` and provide a
test receipt listing public and private/local data changes.
