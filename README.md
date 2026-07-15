# Gamblock-AI Website

Next.js web app: the public landing page, the Member recovery hub (mood tracker,
journal, missions, psychoeducation), the Kepala supervision dashboard, and the
Admin portal. The PKM core additionally requires intention setting,
impulse-awareness education, and explainable skill recommendations as part of
one Self-Regulation loop. Talks to the Go/Gin backend without receiving raw
browsing context.

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
    (landing)/             # landing, dampak, technology, and legal pages
    approve/[token]/       # supporting quick-approval deep link
    partner/invitations/   # partner invitation acceptance
    onboarding/            # authenticated onboarding flows
components/
  landing/                 # marketing sections and scroll animations
  dashboard/               # authenticated navbar and sidebar
  common/                  # PageTransition and reusable cross-surface helpers
  auth/                    # authentication composition
  ui/                      # shadcn-style primitives
hooks/          # use-api, use-accountability, use-dashboard-data, use-progress-data
lib/            # api-client.ts (envelope + refresh), config, messages, feedback
middleware.ts   # route protection (cookie token)
routes.ts       # route constants + PROTECTED/GUEST lists
docs/ai/        # clone-portable AI context guide and manifest
```

Dashboard route transitions are implemented by
`components/common/PageTransition.tsx` and mounted from
`app/[locale]/(dashboard)/layout.tsx`.

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
