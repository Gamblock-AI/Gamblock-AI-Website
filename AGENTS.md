<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gamblock-AI Website Agent Rules

See the root `AGENTS.md` (one level up) for the full architecture and PRD
alignment. The rules below are specific to this Next.js app.

## Next.js version

**Always respect the `nextjs-agent-rules` block above.** This is a
non-standard Next.js version; read `node_modules/next/dist/docs/` before using
any API, hook, or file convention. Do not assume App Router behavior from older
Next.js versions.

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

- Authenticated screens live under `app/(app)/`; auth under `app/(auth)/`;
  public marketing pages at the `app/` root (`page.tsx`, `dampak/`,
  `technology/`).
- Shared UI primitives are shadcn-style under `components/ui/`. Compose them;
  do not duplicate styling.
- Marketing scroll animations live under `components/marketing/`.
- Data fetching goes through the hooks in `hooks/` (`use-api`, `use-dashboard`,
  `use-progress`, `use-accountability`), which call `lib/api-client.ts`.

## API & auth

- `lib/api-client.ts` is the single fetch wrapper. It expects the backend
  envelope `{ data, error, request_id }`, auto-refreshes on 401, and fans out
  the new token to in-flight requests. Do not bypass it with raw `fetch` for
  authenticated calls.
- Route protection is in `middleware.ts`, keyed on the `gamblock_access_token`
  cookie (set by the client on login/refresh). Keep `routes.ts` as the source of
  truth for `PROTECTED_ROUTES` / `GUEST_ROUTES`.
- Quick approval (`/approve/[token]`) is token-authenticated, not
  session-authenticated (PRD §5.2). Keep it reachable without login.

## Testing

- `npm test` (vitest). Config in `vitest.config.ts`, setup `vitest.setup.ts`
  (jsdom + `@testing-library/jest-dom` + `chrome`/`matchMedia` stubs).
- Tests are `*.test.ts(x)` and excluded from `tsconfig` (vitest owns them).
- Fetch is mocked with MSW (`setupServer`) in hook tests; never hit the real API.
- Keep the Playwright e2e in `e2e/` green; add flows for new critical paths.
- `lib/config.ts` reads `NODE_ENV` live (getters) so tests can flip
  `config.isProduction` by setting `process.env.NODE_ENV`.

## Micro-interactions & messaging

- **Messages**: `lib/messages.ts` is the FE mirror of the backend
  `internal/i18n/messages.go` catalog. Resolve any thrown error to a
  production-safe string via `friendlyMessage(err)`; throw `ApiError` (never
  generic `Error`) from `lib/api-client.ts` so `code`/`status` propagate.
- **Env gate**: `config.isProduction` (from `NODE_ENV`) decides whether users see
  friendly text (production) or technical detail (dev). The backend does the same
  with `APP_ENV`.
- **Feedback**: use `lib/feedback.ts` (`toastSuccess`/`toastError`/`withFeedback`)
  for consistent sonner toasts. Do not swallow errors with `console.error` only —
  surface a toast where the user took an action.
- **Micro-interactions** (all honour `prefers-reduced-motion` via `useReducedMotion`
  or `motion-reduce:` variants):
  - Button press scale lives in `components/ui/button.tsx` (framer-motion `whileTap`).
  - Loading uses `components/ui/skeleton.tsx`; empty lists use
    `components/ui/empty-state.tsx`.
  - Route transitions wrap children in `components/feedback/PageTransition.tsx`
    inside `(app)/layout.tsx`.
- Do not reintroduce `setTimeout(()=>fetch(),0/100)` deferral hacks — call fetches
  directly in `useEffect` (setState only after `await`).

## Privacy (PRD §6.1)

- The supervision dashboard shows **aggregate** scores only — never raw URLs or
  browsing history (PRD §3.4-C "Strict Privacy Analytics"). Do not add fields
  that expose a Member's visited URLs.
- The browser extension redirects to `/pattern-interrupt` is NOT used by this
  app; Pattern Interrupt is rendered by the client app / Windows Service, not
  the website. Do not add a `/pattern-interrupt` route here unless the recovery
  hub explicitly needs it.

## E2E

Playwright specs live in `e2e/`. Do not break existing specs; add coverage for
new authenticated flows under `e2e/`.
