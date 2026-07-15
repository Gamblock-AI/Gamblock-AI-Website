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
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run verify:ai-context
npm run dev                  # http://localhost:3000
```

For AI-assisted work, read `AGENTS.md` and `docs/ai/README.md` before changing
code. The context manifest is `docs/ai/manifest.yaml` and its current version is
`2026-07-15.2`.

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
lib/            # api-client, config/messages, and versioned recovery domain
middleware.ts   # route protection (cookie token)
routes.ts       # route constants + PROTECTED/GUEST lists
docs/ai/        # clone-portable AI context guide and manifest
```

Dashboard route transitions are implemented by
`components/common/PageTransition.tsx` and mounted from
`app/[locale]/(dashboard)/layout.tsx`.

## Recovery prototype

The redesigned student dashboard is action-first: intention, private check-in,
one API-backed mission, an explained skill, then a weekly review. Sensitive
prototype state uses the bounded, versioned `gamblock:recovery:v1` browser
store. Its schema intentionally has no URL, domain, DOM, browsing-history, or
free-text check-in field, and the recovery page provides an explicit local-data
clear action.

Mission completion uses `GET /v1/missions/today` and `PATCH /v1/missions`.
Published psychoeducation comes from the backend and Markdown is rendered
through a text-only allowlist. The public `/post-intervention` page provides a
parameter-free grounding/help entry; native automatic handoff is not wired yet.

Browser-local state is prototype persistence, not a claim of durable encrypted
or cross-device storage. See the umbrella `context/progress-tracker.md` when
working from the full workspace.

## API client

`lib/api-client.ts` wraps fetch with the backend envelope (`{ data, error,
request_id }`), auto-refreshes the access token on 401, and stores tokens in
`localStorage` + a `gamblock_access_token` cookie (read by `middleware.ts`).

## Quick approval (supporting feature)

`/approve/[token]` resolves an uninstall request via a single-use token, without
requiring the Kepala to log in on mobile.

## Validation commands

| Command | Purpose |
|---|---|
| `npm run verify:ai-context` | Validate required AI context, paths, adapters, and tracking |
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
