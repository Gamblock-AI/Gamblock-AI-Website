# Website AI Context

**Context version:** `2026-07-20.4`

This directory makes the website repository self-contained for AI coding tools.
`AGENTS.md` is the canonical instruction file; provider-specific files only
point tools at that shared source. `manifest.yaml` is the machine-checkable
inventory used by `scripts/verify-ai-context.sh`.

The PKM proposal is the product authority. Website core is `PKM-WEB-001`,
`PKM-WEB-002`, `PKM-WEB-003`, `PKM-WEB-004`, `PKM-WEB-005`, `PKM-WEB-006`,
and `PKM-WEB-007`: post-block psychoeducation, intention, impulse-awareness
education, mood tracking, daily missions, skill recommendations, and a coherent
self-regulation review loop. Other website surfaces are supporting/operational
and must preserve the on-device browsing-data boundary.

Current dashboard status (`implemented`): every authenticated role lands on
`/dashboard` with a distinct surface. The student dashboard preserves its
own-account seven-day check-in trend, activity/protection aggregates, education
continuation, help, and compact shortcuts. The partner dashboard shows group,
pending-decision/contact, and consented protection aggregates without private
recovery details. The admin dashboard shows operational attention counts and
links to isolated work areas. Device/model implementation versions stay out of
the student canvas.
PKM core `PKM-WEB-004` is available as a once-per-`Asia/Jakarta`-day check-in
gate across authenticated dashboard routes, with optional urge disclosure and
an account-persistence acknowledgement;
`PKM-WEB-005` and `PKM-WEB-006` remain available from the student-only FAB
mounted by the authenticated dashboard layout. No browsing details enter these
surfaces. Partner monitoring of raw check-in values remains `planned` until an
explicit consent, visibility, and revocation design is implemented. This
insight-first main canvas differs from the target “Today first” information
architecture in `context/ui-context.md`; the mandatory gate and global FAB
preserve direct access to the core recovery loop while that product-level gap
remains open.

Supporting account recovery status (`implemented code-complete prototype`):
the locale-aware forgot-password screen requests a non-enumerating email code,
accepts the 12-character single-use code plus a new password, preserves inline
safe errors, and returns to login after success. Production delivery depends on
the backend SMTP adapter and operational email evidence. Google login maps the
explicit link-required backend response safely; same-email linking is available
from the native student Settings flow.

Operational delivery status: production images bake
`https://api.gamblock-ai.com` and the public web Google client ID through
GitHub variables, then deploy to the pinned VPS as root over password SSH only
when `ENABLE_VPS_DEPLOY=true`. The public site is `https://gamblock-ai.com`;
deployment remains gated until infrastructure bootstrap and backend SMTP are
ready.

Supporting error-surface status (`implemented`): locale 404 and runtime error
boundaries share a minimal, keyboard-accessible Gami status page. Temporary
rendering failures provide Next.js retry plus a safe home route; unmatched URLs
and root-layout failures use self-contained global fallbacks. User-facing copy
never renders exception details, digests, URLs, form values, tokens, or recovery
content, while unexpected errors reach the sanitized development-only logger.
Expected 4xx values are detected structurally and never trigger the Next.js
development console overlay; duplicate reports of the same unexpected object
are suppressed. Stable error codes take precedence over generic action copy,
and password/auth forms announce contextual errors without clearing user input.
Stopped or unreachable local APIs are also treated as a recovery-focused UI
state rather than exposing the browser's technical fetch exception.

Operational routing status (`implemented`): development keeps Turbopack enabled
but disables its cross-run filesystem persistence after reproduced stale graphs
generated `AppRoutes = never` and false 404 responses for valid locale routes.
Proxy locale parsing now derives from `i18n/routing.ts`; production routing and
cache behavior are unchanged.

Supporting dashboard/profile status (`implemented`): paired student dashboard cards
stretch to a shared row height; the support card uses its additional space for
a direct recovery-plan action. Global search combines role-permitted navigation
with published education modules only after search is opened for student or
partner accounts. Authenticated
users can crop/resize, upload, replace, and remove a square WebP profile avatar;
the avatar is fetched only within authenticated sessions and removal restores
the initials fallback. Password-backed accounts use the wired current-password
change endpoint and reauthenticate after refresh-token revocation, while
provider-only accounts do not receive an unusable password form. Settings hides
student/partner-only destinations from the admin role and the local recovery
sync preference immediately attempts the current active intention with an
accessible retry state.

Operational data-request status (`implemented`): all authenticated accounts can
create their own export, account deletion remains student/partner-only, active
requests disable duplicate submission, and recent-auth download preserves the
return path through login. Only completed, unexpired managed archives expose a
download action; failed, expired, and legacy records without a real file explain
their state and offer a replacement export.

Supporting support-workspace status (`implemented`): `/support` is available
only to `user` and `partner` requesters and presents two explicit recipient
channels without merging their records. Connected students
send encrypted structured contact requests to their partner and can inspect,
cancel, close, or request follow-up according to status; partners acknowledge
and close those requests. The Gamblock-AI team channel creates
category/priority/impact cases, its rail shows the three newest cases,
`/support/history` exposes the full requester-scoped ticket list, and
`/support/[id]` provides encrypted threaded replies plus close/seven-day-reopen
actions. Status badges accompany color in both channels.

Supporting accountability status (`implemented`, `WEB-SUP-ACC-001` through
`003`): backend-authoritative `user` and `partner` accounts share the same
locale routes with different actions. Students preview/confirm one group,
stage and explicitly save four aggregate-sharing categories, send structured
contact requests, cancel a pending normal exit, and use immediate unsafe exit
when needed. `/partners` owns relationship/group setup and privacy-safe status
summaries, while `/accountability` owns confirmed protection and exit
decisions, status/history visibility, and the support-review route after an
unsafe exit. Verified partners create multiple groups,
rotate codes, inspect consented aggregates, remove members, archive empty
groups, and resolve scoped protection/leave requests with recent auth.

Supporting recovery/progress status (`implemented`, `WEB-SUP-REC-001` and
`WEB-SUP-PROG-001`): the student uses a calm recovery-room workspace for urge
surfing, 5-4-3-2-1 grounding, focus sprint, encrypted reflection, and support.
Active timers/task labels remain browser-local; completed practices and typed
weekly reviews use a rolling 12-month account view, while deterministic room
decor remains until account deletion. Reflection payload v2 carries the only
recovery free text plus optional next-step/current-focus fields. Student
progress provides inspectable 7/30/90-day activity calendars, suppresses trends
below three check-ins, and generates CSV/print-to-PDF locally after a privacy
warning. Partner progress uses only category-specific member aggregates and
never the student trend endpoint. Partner recovery is a CMS-authored response
simulator and never record access. The complete `PKM-WEB-002` focus-period and
reminder lifecycle remains incomplete core work.

Current mission gamification status (`implemented`, supporting PKM-WEB-005):
the adaptive FAB dialog consumes the server's deterministic `Asia/Jakarta` set
of one primary plus two compact optional bonus tasks. It displays fixed rewards,
personal level progress, explicit locked/claimable/claimed/skipped states, one
bounded primary replacement, and an optional encrypted 30-second reflection.
Only the backend can mark a task claimable or persist adjustment state; the UI
has no self-completion or undo control. There is no random reward, paid currency,
leaderboard, punitive streak, casino celebration, or partner projection.

Current psychoeducation status (`implemented`, PKM core `PKM-WEB-003`): the
library and direct reader consume only published, revisioned bilingual
documents allowed for the caller's student/partner role and track required
sections, media, and knowledge checks. Documents explicitly distinguish
articles from response simulators. Rich text
is rendered from an allowlisted JSON tree without raw HTML. Uploaded
image/video/PDF media is served by the backend; external media remains
click-to-load. The content-admin workspace supports WYSIWYG authoring,
single/multiple 16:9 thumbnails with browser-side crop/resize, bilingual
metadata and sections, source/reviewer evidence, optimistic draft revisions,
and review/publish/archive transitions.

## Context load order

1. Read `AGENTS.md` for invariants, architecture, paths, and verification.
2. Read this guide to select only the context relevant to the task.
3. Inspect adjacent implementation and tests before editing.
4. For Next.js APIs or conventions, run `npm ci` only when dependencies are
   absent, then read the relevant guide in `node_modules/next/dist/docs/`; do
   not rely on older framework knowledge.
5. For a cross-repository task launched from the Gamblock-AI umbrella, load its
   shared contract context explicitly. A standalone website clone does not
   require a parent checkout.

## Provider map

| Tool                         | Repository entry point            | Behavior                                        |
| ---------------------------- | --------------------------------- | ----------------------------------------------- |
| Codex and AGENTS-aware tools | `AGENTS.md`                       | Canonical instructions                          |
| Claude Code                  | `CLAUDE.md`                       | Imports `AGENTS.md` and this guide              |
| Gemini CLI                   | `GEMINI.md`                       | Imports `AGENTS.md` and this guide              |
| GitHub Copilot               | `.github/copilot-instructions.md` | Thin repository adapter                         |
| Cursor                       | `.cursor/rules/gamblock-ai.mdc`   | Always-applied rule importing canonical context |
| Legacy tools                 | `COPILOT.md`, `.cursorrules`      | Compatibility pointers only                     |

## Task-specific context

- Routes, locale handling, or auth redirects: inspect `app/[locale]/`,
  `routes.ts`, `proxy.ts`, and relevant e2e specs.
- API data: inspect `lib/api-client.ts`, `lib/config.ts`, the relevant
  `hooks/use-*.ts`, and their Vitest tests.
- Dashboard/recovery UI: inspect `app/[locale]/(dashboard)/`,
  `components/dashboard/`, `lib/recovery/`, the relevant recovery hooks, and
  `design-system/gamblock-ai-recovery-dashboard/`.
- Accountability: group codes are hashed, rotatable, rate-limited discovery
  values; preview plus explicit confirmation creates the active membership.
  Approval authority comes from that backend membership, not a client-side role
  label. Student protection-change requests start in the native client; quick
  tokens remain single-use secrets and never enter logs or analytics.
- Operations: each sidebar route and its scoped fetches require the unified
  `admin` role. Content creation is draft only, artifact validation requires a
  real server-side file/checksum, and
  user/device emergency requests require review and issuance by two distinct
  administrators.
- Research sandbox: all fixtures are deterministic and explicitly synthetic;
  real enrollment/export stays locked until an approved protocol exists.
- Post-intervention handoff: inspect
  `app/[locale]/(landing)/post-intervention/`, `routes.ts`, and the umbrella
  privacy/architecture contract when available. Never add browsing context to
  its URL or client state.
- Psychoeducation: inspect the education routes, `hooks/use-education.ts`,
  `components/education/rich-content.tsx`, and the admin content workspace;
  user views must not expose draft/archived content or render raw HTML.
- Landing UI: inspect `app/[locale]/(landing)/` and `components/landing/`.
- Messages or feedback: inspect `lib/messages.ts`, `lib/feedback.ts`,
  `lib/diagnostics.ts`, `i18n/messages.ts`, the relevant domain JSON under
  `messages/<locale>/`, and the backend/Flutter catalogs when the wider
  monorepo is available. Locale module names and nested keys must stay aligned;
  run `npm run i18n:check`. UI copy stays non-technical in development and
  production; sanitized diagnostics are console-only in development.
- AI-context maintenance: inspect every file listed in `manifest.yaml` and run
  the verifier before and after editing.

Do not load unrelated source trees preemptively. Prefer the smallest relevant
context set, while always retaining the privacy and API-boundary rules from
`AGENTS.md`.

## Fresh-clone workflow

```sh
npm ci
cp .env.example .env.local # configure API and optional Google public client ID
npm run verify:ai-context
npm run i18n:check
npm run lint
```

Use `npm run verify:ai-context -- --allow-untracked` while initially creating
new context files. Strict mode is intentional in CI: every required context
file must be committed so another clone receives the same instructions.

## Updating context

1. Update `AGENTS.md` first when a durable rule, path, or command changes.
2. Keep provider adapters thin; do not duplicate detailed architecture there.
3. Bump `context_version` in `AGENTS.md`, this file, and `manifest.yaml` for a
   meaningful context contract change.
4. Update `README.md` when developer onboarding or the visible structure changes.
5. Run the context verifier and lint. Typecheck, unit/E2E tests, and production
   builds run only when the user explicitly requests them in the current
   conversation.

Never place secrets, personal instructions, credentials, machine-specific
paths, or session-only notes in committed AI context.

## Current operational UI truth

The locale-aware admin shell belongs to the unified `admin` role. Content,
releases, tickets, emergency access, and platform settings are separate sidebar
routes; research remains a separate destination. Together they expose CMS
revision/rollback, claim-owned support replies, eligible data requests, managed
artifact rollout, direct three-role account provisioning, safe social-link
settings, audit history, and dual-control emergency access. An authoritative
`/me` route guard keeps admin accounts out of consumer and requester-support
pages while allowing dashboard, profile, settings, and data requests.

The landing footer fetches `/v1/public/site-social-links` and renders enabled,
non-null records only. The data-request UI supports encrypted export download
and a protected deletion-confirmation route. These are operational/supporting
features; external delivery, release signing, automated rollout health, and
research administration are not claimed complete.
