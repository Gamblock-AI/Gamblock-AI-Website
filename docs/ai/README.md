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
| Dashboard (student/partner/admin) | implemented | Per-role surface terpisah di `/dashboard` |
| Mood/urge check-in | implemented | Form check-in harian dengan mood/urge scale, privacy-safe |
| Daily missions | implemented | 5 slot harian `Asia/Jakarta`, 10 EXP/slot, custom missions |
| Learning Hub / skills | implemented | Katalog UTY 22 program, 5 cluster, progress account-scoped |
| Intention + weekly review | implemented | Intention manager local-first, weekly review terenkripsi |
| Psychoeducation | implemented | Dokumen bilingual berversi, progress per-revision |
| Post-intervention handoff | implemented | `/post-intervention` tanpa browsing context |
| Accountability | implemented | Group/partner lifecycle, removal approval, aggregate dashboard |
| Recovery/progress | implemented | Journal terenkripsi, grounding tools, recovery room, progress 7/30/90 |
| Support workspace | implemented | Encrypted threaded support, requester + admin queue |
| Account recovery | implemented | Non-enumerating email code, 12-character single-use |
| PKM transparency | implemented | `/pkm` route dengan evidence maturity, deliverables state |
| Admin control plane | implemented | Content CMS, releases, tickets, emergency, platform |
| Onboarding | implemented | Registration/login, Google OAuth, partner invitation |
| Data export/deletion | implemented | AES-256-GCM encrypted export ZIP, self-service deletion |

Context version: `2026-08-02.24`

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
