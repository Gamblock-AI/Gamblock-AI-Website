# Gamblock-AI Website — GitHub Copilot Instructions

Read and follow `AGENTS.md` before proposing or editing code. It is the
canonical, clone-portable website instruction source. Use `docs/ai/README.md`
for context routing and `docs/ai/manifest.yaml` for the required context
inventory.

- npm and `package-lock.json` are canonical.
- Preserve the privacy boundary: never expose raw URLs, DOM content, domains,
  or browsing history through website/backend payloads.
- Use hooks and `lib/api-client.ts` for backend calls; do not add raw fetches to
  pages or components.
- Run `npm run lint -- <changed-source-files>` for routine changes and the
  context validator when context changes. Typecheck, tests, builds, and E2E
  require the user's explicit request.
