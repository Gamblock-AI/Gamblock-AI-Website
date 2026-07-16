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
cp .env.example .env.local   # set API URL and optional Google client ID
npm run verify:ai-context
npm run dev                  # http://localhost:3000
```

For AI-assisted work, read `AGENTS.md` and `docs/ai/README.md` before changing
code. The context manifest is `docs/ai/manifest.yaml` and its current version is
`2026-07-16.3`.

## Structure

```
app/
  [locale]/
    (dashboard)/           # authenticated dashboard, recovery, progress,
                           # education, accountability, admin, and settings
    (auth)/                # login, register, forgot-password
    (landing)/             # landing, post-intervention, impact, technology,
                           # and legal pages
    approve/[token]/       # supporting quick-approval deep link
    partner/invitations/   # partner invitation acceptance
    onboarding/            # authenticated onboarding flows
components/
  landing/                 # marketing sections and scroll animations
  dashboard/               # responsive shell, Today dashboard, and navigation
  education/               # safe published-content rendering
  common/                  # PageTransition and reusable cross-surface helpers
  auth/                    # authentication composition
  ui/                      # shadcn-style primitives
hooks/          # authenticated API hooks and browser-local recovery hooks
i18n/           # locale routing plus explicit modular-catalog server loader
lib/            # api-client, config/messages, and versioned recovery domain
messages/
  en/           # English JSON split by product domain
  id/           # Indonesian JSON with the same modules and nested keys
middleware.ts   # route protection (cookie token)
routes.ts       # route constants + PROTECTED/GUEST lists
docs/ai/        # clone-portable AI context guide and manifest
```

Dashboard route transitions are implemented by
`components/common/PageTransition.tsx` and mounted from
`app/[locale]/(dashboard)/layout.tsx`.

## Recovery prototype

The redesigned student dashboard is action-first: intention, current mission,
quick check-in, recovery overview, explained next actions, and a weekly review.
It uses calm status feedback, meaningful four-or-more-point trend charts, and
reduced-motion-safe hover/press interactions instead of punitive streak or
casino-like rewards.

Recovery remains local-first in the bounded, versioned
`gamblock:recovery:v1` browser store. Intention and structured check-in sync are
separate opt-in categories in Settings; failures remain visible and preserve
the local record. Weekly plans, recommendations, and other deeper recovery
state remain local. The schema contains no URL, domain, DOM, browsing history,
or detected-page field.

Mission completion uses `GET /v1/missions/today` and `PATCH /v1/missions`.
Published psychoeducation comes from the backend and Markdown is rendered
through a text-only allowlist. The public `/post-intervention` page provides a
privacy-safe grounding/help entry; the Flutter Pattern Interrupt handoff now
opens it with only locale and `source=pattern_interrupt`.

Browser-local state is not a claim of encrypted or universally cross-device
storage. Only enabled categories use the backend. See `docs/ai/README.md` for
current website capability status and the umbrella
`context/proposal-requirements.md` for requirement-level targets.

## API client

`lib/api-client.ts` wraps fetch with the backend envelope (`{ data, error,
request_id }`), auto-refreshes the access token on 401, and stores tokens in
`localStorage` + a `gamblock_access_token` cookie (read by `middleware.ts`).
User-facing failures always resolve through friendly copy. Expected 4xx
outcomes stay in the UI without noisy console errors. In development,
unexpected network/server failures write sanitized details through
`lib/diagnostics.ts`; production suppresses those console diagnostics.

The Content Security Policy uses the same configured API origin as the client
bundle, including when a production build is previewed against a local backend.
Development additionally permits loopback HTTP/WebSocket origins for Next.js
and local API tooling. Docker production builds require an explicit
`NEXT_PUBLIC_API_URL`, so an image cannot silently ship with a localhost API.

The current website does not install a service worker. `public/sw.js` and
`LegacyServiceWorkerCleanup` only retire root-scoped workers left by older PWA
builds; the cleanup does not clear authentication, recovery records, or other
browser storage.

## Quick approval (supporting feature)

`/approve/[token]` resolves an uninstall request via a single-use token, without
requiring the Kepala to log in on mobile.

Partner invitations are email-bound, expire after seven days, and show their
share link only after creation. The accountability workspace supports multiple
relationships, owner cancellation, and relationship-authorized partner
approve/deny actions. The operations panel is role-aware; content saves as
draft, release submissions require a real server artifact plus SHA-256, and
emergency access requires two distinct platform administrators.

Google Identity Services renders only when
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured to match the backend. Self-service
password reset is intentionally shown as unavailable until a verified email
delivery adapter exists; the UI does not simulate a sent reset email. CI passes
both public settings as Docker build arguments; the Google value remains
optional and its absence is treated as a normal disabled state rather than a
runtime warning.

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

| Command | Purpose |
|---|---|
| `npm run verify:ai-context` | Validate required AI context, paths, adapters, and tracking |
| `npm run i18n:check` | Validate modular locale files, namespaces, and key parity |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run Vitest unit tests |
| `npm run verify` | Run context validation and lint only |
| `npm run build` | Build the production Next.js app |
| `npm run e2e` | Run Playwright end-to-end tests |

The AI runs `npm run lint -- <changed-source-files>` (and the context validator
when relevant) by default. Typecheck, tests, builds, and E2E run only when the
user explicitly requests them. CI may retain automated full gates.

For a task launched from the separate Gamblock-AI umbrella workspace, load its
shared cross-repository contracts explicitly. This repository's own
`AGENTS.md` remains the canonical standalone website instruction source.
