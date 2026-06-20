# Gamblock-AI Website

Next.js web app: the public landing page, the Member recovery hub (mood tracker,
journal, missions, psychoeducation), the Kepala supervision dashboard, and the
Admin portal. Talks to the Go/Gin backend.

## Run

```sh
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, and Playwright e2e (`e2e/`).

## Structure

```
app/
  (app)/        # authenticated app shell: dashboard, progress, recovery,
                #   education, accountability, partners, admin, settings, support
  (auth)/       # login, register
  approve/[token]/        # quick-approval deep link (PRD §5.2)
  partner/invitations/    # partner invitation acceptance
  dampak/, technology/    # public marketing pages
  page.tsx                # landing page (scroll-driven animation)
components/
  marketing/    # landing scroll animations
  layout/       # navbar, sidebar
  ui/           # shadcn-style primitives
hooks/          # use-api, use-accountability, use-dashboard-data, use-progress-data
lib/            # api-client.ts (envelope + refresh), auth.ts, utils.ts
middleware.ts   # route protection (cookie token)
routes.ts       # route constants + PROTECTED/GUEST lists
```

## API client

`lib/api-client.ts` wraps fetch with the backend envelope (`{ data, error,
request_id }`), auto-refreshes the access token on 401, and stores tokens in
`localStorage` + a `gamblock_access_token` cookie (read by `middleware.ts`).

## Quick approval (PRD §5.2)

`/approve/[token]` resolves an uninstall request via a single-use token, without
requiring the Kepala to log in on mobile.

See the root `AGENTS.md` for the full architecture and PRD alignment.
