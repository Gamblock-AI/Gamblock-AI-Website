# Gamblock-AI Website

Next.js web app for the public Gamblock-AI site, the student recovery journey,
privacy-safe partner support, and operational surfaces. The student experience
connects intention setting, structured mood/urge check-ins, daily missions,
psychoeducation, explained skill suggestions, and a weekly Self-Regulation
review. It talks to the Go/Gin backend without receiving raw browsing context.

## Fresh clone

npm is the canonical package manager for this repository. `package-lock.json`
drives local and CI installs; the existing `bun.lock` is retained but is not the
install source of truth.

```sh
nvm use                    # reads .nvmrc (Node 20)
npm ci
cp .env.example .env.local   # set API URL, public app URL, and education-media origins
npm run verify:ai-context
npm run dev                  # http://localhost:3000
```

Development intentionally disables Turbopack's cross-run filesystem cache. A
stale persisted route graph can omit `app/[locale]` routes and return false
404s even though the route files are valid. Each `npm run dev` therefore
rebuilds the compiler graph while retaining normal incremental compilation for
the lifetime of that process; production build caching is unchanged. When
upgrading an existing checkout that already has a bad cache, stop the active
development server and remove only `.next/dev` once before restarting it.

For AI-assisted work, read `AGENTS.md` and `docs/ai/README.md` before changing
code. The context manifest is `docs/ai/manifest.yaml` and its current version is
`2026-08-09.2`.

## Structure

```
app/
  [locale]/
    (dashboard)/           # authenticated dashboard, recovery, progress,
                           # education, skills, accountability, partners,
                           # support, profile, data-requests, research-sandbox,
                           # admin, and settings
    (auth)/                # login, register, forgot-password
    (landing)/             # landing, post-intervention, impact, technology,
                           # PKM transparency, and legal pages
    approve/[token]/       # supporting quick-approval deep link
    partner/invitations/   # legacy redirect to the partner workspace
    operator/invitations/  # retired-invitation notice for legacy links
    onboarding/            # authenticated onboarding flows
    verify-email/          # email verification landing
components/
  landing/                 # marketing sections and scroll animations
  dashboard/               # responsive shell, Today dashboard, and navigation
  account/                 # authenticated profile/avatar composition
  education/               # rich-text reader, checks, media, and admin editor
  common/                  # PageTransition and reusable cross-surface helpers
  auth/                    # authentication composition
  error/                   # shared Gami error-status page for all boundaries
  ui/                      # shadcn-style primitives
hooks/          # authenticated API hooks and browser-local recovery hooks
i18n/           # locale routing plus explicit modular-catalog server loader
lib/            # api-client, config/messages, and versioned recovery domain
messages/
  en/           # English JSON split by product domain
  id/           # Indonesian JSON with the same modules and nested keys
proxy.ts        # route protection (cookie token)
routes.ts       # route constants + PROTECTED/GUEST lists
docs/ai/        # clone-portable AI context guide and manifest
docs/           # landing-assets inventory and design-system references
```

Dashboard route transitions are implemented by
`components/common/PageTransition.tsx` and mounted from
`app/[locale]/(dashboard)/layout.tsx`.

## Recovery experience

Every authenticated role lands on a dedicated dashboard. The student dashboard
remains insight-first with privacy-safe aggregate analytics, protection
information, weekly check-in trends, education, help, and shortcuts. The partner
dashboard highlights groups, pending decisions/contacts, and a consented
seven-day analytics panel with total and per-student classified-and-held access
counts, protection/support context, active-group filtering, and name search.
Shared zero remains distinct from “not shared”; no browsing detail, risk score,
or member ranking is rendered. The admin dashboard centralizes operational attention counts
and links to its separate workspaces. The admin-only `/admin/learning-hub`
workspace manages UTY catalog drafts, taxonomy, editorial transitions, and
revision rollback without exposing student progress or reflections. The
requester support workspace is limited
to `user` and `partner` and separates two recipient channels. Partner contact
requests remain scoped to the connected relationship, while Gamblock-AI team
tickets show a newest-first three-ticket summary;
`/[locale]/support/history` provides the complete requester-scoped ticket
history and `/[locale]/support/[id]` provides encrypted threaded replies and
status actions. The partner page owns relationship/group setup, and the
accountability page owns staged aggregate-sharing changes, confirmed
protection decisions, and cancellable pending normal-exit requests. Unsafe
exit remains immediate and routes recovery through the support team.
The PKM recovery loop remains directly available through a student-only
gamification FAB and a once-per-day check-in gate across authenticated
dashboard pages. The gate uses the `Asia/Jakarta` calendar boundary and
requires a mood choice plus a gambling-urge answer on a scale that starts at an
explicit “no urge” point; picking a mood shows a short supportive Gami reply,
with a direct support link on the most distressed mood. UI feedback remains
calm and avoids punitive streak or casino-like rewards. A student-only
`/skills` page adds curated free-course links beside the internal skill
practices.

Recovery begins with a local-first intention manager for the student's reason,
next action, and focus period, then continues into the server-verified daily
mission card above a calm, keyboard-accessible dorm-room
workspace. The window opens three-minute urge surfing, the rug guides
5-4-3-2-1 grounding, the desk starts a ten-minute focus sprint, the notebook
opens the encrypted reflection journal, and the phone opens partner/support
choices. Active timers and focus
task labels stay browser-local. Completed practices and typed weekly reviews
sync to the account for a rolling 12-month view; each weekly review receives at
most one server-authoritative 10-EXP grant under the shared daily cap.
Deterministic decor placement remains until account deletion and is included
in export/deletion. Reflection
payload v2 is AES-256-GCM encrypted and can carry an optional next step and one
current-focus marker. Legacy local intention text is never uploaded without a
one-time opt-in import. The schema contains no URL, domain, DOM, browsing
history, or detected-page field.

Student progress renders inspectable 7/30/90-day activity calendars across
check-ins, practices, journal entries, missions, education, and weekly reviews.
Trend language stays unavailable below three check-ins. `/recovery` is
student-only; partner guidance uses role-filtered CMS response modules in a
`/progress` dialog, while partner progress consumes only consented aggregate categories
and never student recovery details.

`GET /v1/missions/today` supplies exactly five `Asia/Jakarta` daily slots.
Every slot is worth 10 EXP. The website shows only default and custom mission
sources: default tasks remain server-verified and never use a separate locked
card, while custom tasks are private self-attestations and may be edited or
deleted while pending. All available claims use “Klaim EXP”; no skip action or
`/v1/missions/skip` call exists in the website. The website never awards EXP
client-side. Custom titles and self-attestations are private and never shown to
partners or admins. The experience contains no random reward, leaderboard, or
punitive streak.
Published psychoeducation comes from the backend as validated TipTap JSON; raw
HTML is never rendered. The education library supports bilingual sections,
single/multiple thumbnail carousels, click-to-load external media, uploaded
images/video/PDF, revision-scoped progress, and teaching-oriented knowledge
checks. Content admins use the operations workspace for bilingual WYSIWYG
authoring, 16:9 crop/resize, sources/reviewer metadata, and the
draft-review-publish/archive lifecycle. The public `/post-intervention` page provides a
privacy-safe grounding/help entry; the Flutter Pattern Interrupt handoff now
opens it with only locale and `source=pattern_interrupt`.

Browser-local state is not a claim of encrypted storage. Account-stored
check-ins can be restored across devices, while partner monitoring requires a
separate, explicit sharing design before it is available. See `docs/ai/README.md` for current website capability status.

The public `/pkm` route presents project method, milestone, evidence maturity,
privacy/ethical safeguards, limitations, and the six Phase 5 output states.
Draft reports, the video, article, and release artifacts are not exposed as
approved downloads until their external review/submission/publication records
exist. The landing footer provides the discoverable link.

## Error surfaces

Locale-aware 404 and route error boundaries use one minimal status-page system
with safe Indonesian/English copy, a home action, history-aware back behavior,
and retry for temporary rendering failures. `app/global-not-found.tsx` covers
unmatched URLs when the top-level locale layout cannot be composed, while
`app/global-error.tsx` replaces a failed root layout. Both global fallbacks are
self-contained and show no exception message, URL, token, form value, or
recovery data. Generated Gami illustrations live under `public/images/errors/`.

## API client

`lib/api-client.ts` wraps fetch with the backend envelope (`{ data, error,
request_id }`), auto-refreshes the access token on 401, and stores tokens in
`localStorage` + a `gamblock_access_token` cookie (read by `proxy.ts`).
User-facing failures always resolve through friendly copy. Expected 4xx
outcomes stay in the UI without noisy console errors. In development,
unexpected network/server failures write sanitized details through
`lib/diagnostics.ts`; production suppresses those console diagnostics.

The Content Security Policy uses the same configured API origin as the client
bundle, including when a production build is previewed against a local backend.
Development additionally permits loopback HTTP/WebSocket origins for Next.js
and local API tooling. Docker production builds require an explicit
`NEXT_PUBLIC_API_URL`, so an image cannot silently ship with a localhost API.

The website is a Progressive Web App: `app/manifest.ts` provides the install
manifest, `public/sw.js` is a real service worker (app-shell precache, runtime
asset caching, network-first navigations, and Web Push handling), and
`components/pwa/service-worker-register.tsx` registers it in the root layout.
The service worker never intercepts or stores account credentials; browser
storage for authentication and recovery records is untouched.

The opt-in daily reminder is delivered to the PWA through Web Push
(`NEXT_PUBLIC_VAPID_PUBLIC_KEY` must match the backend `VAPID_PUBLIC_KEY`).
Notification clicks open `/{locale}/recovery`. Reminder preferences sync through
`/v1/me/reminder-preference` so the same time applies on Android and Windows
native apps.

The profile page crops/resizes a selected image in the browser before uploading
a square WebP avatar. Avatar retrieval stays authenticated through the central
API client and is only shown in authenticated website sessions; removing it
returns the interface to its initials fallback. Password-backed accounts can
change their password by confirming the current value and are signed out after
backend session revocation. Dashboard search combines
role-permitted navigation with published education modules after the search is
opened.

Settings navigation is role-aware: recovery-plan sync is student-only, while
accountability and support links appear only for student/partner accounts. The
opt-in recovery-plan switch remains browser-local and immediately attempts to
sync an active plan when enabled, with an inline retry state when delivery
fails. Data-request history shows downloads only for completed, unexpired
managed archives and offers a replacement export for failed, expired, or
legacy-unavailable results.

## Quick approval (supporting feature)

`/approve/[token]` resolves an uninstall request via a single-use token, without
requiring the partner to log in on mobile.

Verified partners create multiple named groups with rotatable codes. Verified
students preview and explicitly confirm one active membership, then control
category-specific aggregate sharing and safe exit. Students initiate protection
pause/removal requests in the native client; the website remains the scoped
partner decision and history surface. The unified `admin` operations panel
provides separate Content, AI Releases, Tickets, Emergency Access, Platform,
and Research destinations for revision/rollback authoring, claim-owned support
replies, eligible data-request actions, managed artifact rollouts, research
tools, direct three-role account provisioning, safe social links, audit history,
and dual-control emergency access. Admins do not use the requester `/support`
surface. Enabled non-null social links
are rendered in the landing footer; empty settings produce no icon.

Self-service password reset uses the backend's non-enumerating
email-code request and single-use confirmation endpoints; production delivery
uses the configured Fonnte WhatsApp gateway and does not expose whether an email is registered. CI passes
both public settings as Docker build arguments.

Production CI builds for `https://gamblock-ai.com` with
`NEXT_PUBLIC_API_URL=https://api.gamblock-ai.com`,
`NEXT_PUBLIC_APP_URL=https://gamblock-ai.com`. Its SSH deploy step uses the pinned VPS host identity with
root/password authentication on port 22 and remains disabled until
`ENABLE_VPS_DEPLOY=true` after infrastructure bootstrap.

## Translation catalogs

Translations are split by product domain under `messages/en/` and
`messages/id/`: `shared`, `marketing`, `legal-support`, `auth`,
`accountability`, `recovery`, `account`, and `operations`. The server-only
loader in `i18n/messages.ts` imports these modules concurrently and merges their
top-level namespaces, so existing `useTranslations(namespace)` calls keep the
same API.

Each namespace belongs to exactly one module. Both locales must contain the
same module files and nested message paths. When adding a domain module, add it
to both locale folders and to both explicit loader lists, then run
`npm run i18n:check`; this prevents silent overrides and partial translations.

## Validation commands

| Command                     | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `npm run verify:ai-context` | Validate required AI context, paths, adapters, and tracking |
| `npm run i18n:check`        | Validate modular locale files, namespaces, and key parity   |
| `npm run lint`              | Run ESLint                                                  |
| `npm run typecheck`         | Run TypeScript without emitting files                       |
| `npm test`                  | Run Vitest unit tests                                       |
| `npm run verify`            | Run context validation and lint only                        |
| `npm run build`             | Build the production Next.js app                            |
| `npm run e2e`               | Run Playwright end-to-end tests                             |

The AI runs `npm run lint -- <changed-source-files>` (and the context validator
when relevant) by default. Typecheck, tests, builds, and E2E run only when the
user explicitly requests them. CI may retain automated full gates.

For a task launched from the separate Gamblock-AI umbrella workspace, load its
shared cross-repository contracts explicitly. This repository's own
`AGENTS.md` remains the canonical standalone website instruction source.
