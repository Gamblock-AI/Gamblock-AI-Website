# Website AI Context

**Context version:** `2026-07-15.2`

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

| Tool | Repository entry point | Behavior |
|---|---|---|
| Codex and AGENTS-aware tools | `AGENTS.md` | Canonical instructions |
| Claude Code | `CLAUDE.md` | Imports `AGENTS.md` and this guide |
| Gemini CLI | `GEMINI.md` | Imports `AGENTS.md` and this guide |
| GitHub Copilot | `.github/copilot-instructions.md` | Thin repository adapter |
| Cursor | `.cursor/rules/gamblock-ai.mdc` | Always-applied rule importing canonical context |
| Legacy tools | `COPILOT.md`, `.cursorrules` | Compatibility pointers only |

## Task-specific context

- Routes, locale handling, or auth redirects: inspect `app/[locale]/`,
  `routes.ts`, `middleware.ts`, and relevant e2e specs.
- API data: inspect `lib/api-client.ts`, `lib/config.ts`, the relevant
  `hooks/use-*.ts`, and their Vitest tests.
- Dashboard UI: inspect `app/[locale]/(dashboard)/`, `components/dashboard/`,
  and `components/common/PageTransition.tsx`.
- Landing UI: inspect `app/[locale]/(landing)/` and `components/landing/`.
- Messages or feedback: inspect `lib/messages.ts`, `lib/feedback.ts`, and the
  backend/Flutter catalogs when the wider monorepo is available.
- AI-context maintenance: inspect every file listed in `manifest.yaml` and run
  the verifier before and after editing.

Do not load unrelated source trees preemptively. Prefer the smallest relevant
context set, while always retaining the privacy and API-boundary rules from
`AGENTS.md`.

## Fresh-clone workflow

```sh
npm ci
cp .env.example .env.local
npm run verify:ai-context
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
