<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Gamblock-AI Website Agent Rules

**Context version:** `2026-07-16.5`

This file is the canonical, clone-portable instruction source for this Next.js
app. Start with `docs/ai/README.md` for the provider map and context-loading
workflow. When a task is coordinated through the Gamblock-AI umbrella
workspace, load its shared contract context explicitly. This file remains
sufficient and authoritative for safe website work in a standalone clone.

## Next.js version

**Always respect the `nextjs-agent-rules` block above.** This is a
non-standard Next.js version; read `node_modules/next/dist/docs/` before using
any API, hook, or file convention. Do not assume App Router behavior from older
Next.js versions.

## Package manager and bootstrap

- **npm is canonical.** Install reproducibly with `npm ci` and update
  `package-lock.json` with npm when dependencies change.
- `bun.lock` is retained for compatibility/history, but it is not the source of
  truth for installs or CI. Do not delete or regenerate it unless a package
  manager migration is explicitly requested.
- Copy `.env.example` to `.env.local` for local development. Never commit an
  `.env*` file containing local values or secrets.
- After a fresh clone, run `npm run verify:ai-context` before implementation so
  missing or stale instruction files fail early.

## Configuration & hooks

- `lib/config.ts` is the single source of truth for env-driven config. Read
  `config.apiUrl` instead of `process.env.NEXT_PUBLIC_API_URL` directly. Add new
  public config keys there, never scatter `process.env` reads across files.
- `lib/api-client.ts` is the only place that builds a fetch URL against the
  backend. It wraps the envelope `{ data, error, request_id }`, auto-refreshes
  on 401, and fans out the new token. Do not call `fetch(...)` directly in
  `app/` or `components/` — always go through a custom hook in `hooks/`.
- Custom hooks (`hooks/use-*.ts`) own all data fetching. When adding an endpoint,
  add/extend a hook; pages and components consume the hook's `{ data, loading,
error, refetch }` shape. See `hooks/use-approval.ts` for the token-based
  (non-session) pattern used by the quick-approval flow.
- Do not use `setTimeout(()=>..., 0)` to defer fetches in `useEffect` — call the
  fetch callback directly. `useCallback` keeps the dependency stable.

## Structure conventions

- All user-facing routes are locale-aware under `app/[locale]/`.
- Authenticated screens live under `app/[locale]/(dashboard)/`; auth screens
  live under `app/[locale]/(auth)/`; public marketing and legal pages live under
  `app/[locale]/(landing)/`.
- Token and onboarding flows live beside those route groups under
  `app/[locale]/approve/`, `app/[locale]/partner/`, and
  `app/[locale]/onboarding/`.
- Shared UI primitives are shadcn-style under `components/ui/`. Compose them;
  do not duplicate styling.
- Marketing sections and scroll animations live under `components/landing/`.
- Dashboard navigation lives under `components/dashboard/`; reusable app-wide
  helpers, including `PageTransition`, live under `components/common/`.
- Data fetching goes through the hooks in `hooks/` (`use-api`, `use-dashboard`,
  `use-progress`, `use-accountability`), which call `lib/api-client.ts`.
- Translation catalogs live in domain modules under `messages/<locale>/`.
  Keep each top-level next-intl namespace in exactly one module, mirror module
  names and nested keys across locales, register modules through the explicit
  server loader in `i18n/messages.ts`, and run `npm run i18n:check`.

## API & auth

- `lib/api-client.ts` is the single fetch wrapper. It expects the backend
  envelope `{ data, error, request_id }`, auto-refreshes on 401, and fans out
  the new token to in-flight requests. Do not bypass it with raw `fetch` for
  authenticated calls.
- Route protection is in `middleware.ts`, keyed on the `gamblock_access_token`
  cookie (set by the client on login/refresh). Keep `routes.ts` as the source of
  truth for `PROTECTED_ROUTES` / `GUEST_ROUTES`.
- Quick approval (`/approve/[token]`) is a supporting flow that is
  token-authenticated, not session-authenticated. Keep it reachable without
  login while preserving single-use/expiry checks.

## Proposal-derived website core

The PKM proposal requires a post-block psychoeducation experience based on
Self-Regulation Theory: intention setting, impulse-awareness education, mood
tracking, daily self-control missions, and skill-development recommendations.
Requirements `PKM-WEB-001`, `PKM-WEB-002`, `PKM-WEB-003`, `PKM-WEB-004`,
`PKM-WEB-005`, `PKM-WEB-006`, and `PKM-WEB-007` outrank supporting dashboards,
journals, admin portals, and marketing polish. The website never receives
browsing context and is not the real-time Pattern Interrupt/blocking surface.

## Validation policy

- `npm run verify:ai-context` validates the portable AI context. While creating
  new, not-yet-tracked context files locally, use
  `npm run verify:ai-context -- --allow-untracked`; CI always uses strict mode.
- `npm run i18n:check` validates locale/module parity, unique namespaces, valid
  JSON, string leaves, and identical nested message paths across languages.
- `npm run lint -- <changed-source-files>` is the default AI code check; use a
  wider path only for a wide refactor. `npm run verify` runs context validation
  plus the repository-wide lint only.
- `npm run typecheck`, `npm test`, `npm run build`, and `npm run e2e` remain
  available but run only when the user explicitly requests that category in
  the current conversation.
- Vitest config is in `vitest.config.ts`; setup is in `vitest.setup.ts`
  (jsdom + `@testing-library/jest-dom` + `chrome`/`matchMedia` stubs).
- Tests are `*.test.ts(x)` and excluded from `tsconfig` (vitest owns them).
- Fetch is mocked with MSW (`setupServer`) in hook tests; never hit the real API.
- Keep Playwright specifications aligned with critical paths when tests are in
  scope, but do not run them by default.
- `lib/config.ts` reads `NODE_ENV` live (getters) so tests can flip
  `config.isProduction` by setting `process.env.NODE_ENV`.
- Google Identity Services is optional and uses public
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; it must match backend `GOOGLE_CLIENT_ID`.
  Do not add OAuth client secrets to `NEXT_PUBLIC_*` variables.

## Micro-interactions & messaging

- **Messages**: `lib/messages.ts` is the FE mirror of the backend
  `internal/i18n/messages.go` catalog. Resolve any thrown error to a
  production-safe string via `friendlyMessage(err)`; throw `ApiError` (never
  generic `Error`) from `lib/api-client.ts` so `code`/`status` propagate.
- **Environment gate**: user-facing errors are concise and non-technical in
  every environment. `config.isProduction` allows sanitized code/status context
  only through `lib/diagnostics.ts` in the development console; production
  emits no browser-console diagnostic. Never pass form values, tokens, URLs, or
  recovery/browsing content to that logger.
- **Feedback**: use `lib/feedback.ts` (`toastSuccess`/`toastError`/`withFeedback`)
  for consistent sonner toasts. Do not swallow errors with `console.error` only —
  surface a toast where the user took an action.
- **Micro-interactions** (all honour `prefers-reduced-motion` via `useReducedMotion`
  or `motion-reduce:` variants):
  - Button press scale lives in `components/ui/button.tsx` (framer-motion `whileTap`).
  - Loading uses `components/ui/skeleton.tsx`; empty lists use
    `components/ui/empty-state.tsx`.
  - Route transitions wrap children in `components/common/PageTransition.tsx`
    inside `app/[locale]/(dashboard)/layout.tsx`.
- Do not reintroduce `setTimeout(()=>fetch(),0/100)` deferral hacks — call fetches
  directly in `useEffect` (setState only after `await`).

## Privacy

- The supervision dashboard shows **aggregate** status/counts only — never raw
  URLs or browsing history. Do not add fields that expose a Member's visited
  URLs or reconstruct a browsing timeline.
- The browser extension redirects to `/pattern-interrupt` is NOT used by this
  app; Pattern Interrupt is rendered by the client app / Windows Service, not
  the website. Do not add a `/pattern-interrupt` route here unless the recovery
  hub explicitly needs it.
- Partner invitation routes are protected and retain a validated relative
  `next` path through login. Approval authority comes from an active backend
  relationship, not from hiding/showing a navigation item.
- Recovery sync is local-first and independently opt-in for intention and
  structured check-in categories. Never silently enable or broaden it.

## E2E

Playwright specs live in `e2e/`. Do not break existing specs; add coverage for
new authenticated flows under `e2e/`.

## AI context maintenance

- `AGENTS.md` is canonical. `CLAUDE.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, and `.cursor/rules/gamblock-ai.mdc` are
  provider adapters and must remain thin.
- `docs/ai/manifest.yaml` inventories every required context surface. Keep its
  `context_version` synchronized with this file and `docs/ai/README.md`.
- When paths, commands, architecture, or invariants change, update the canonical
  documentation in the same change and run `npm run verify:ai-context`.
