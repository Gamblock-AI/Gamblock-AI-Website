# Translation Catalogs

Each locale has the same domain modules. A module owns complete top-level
next-intl namespaces; components continue to call
`useTranslations('namespace')` without knowing which file contains it.

| Module | Owned namespaces |
|---|---|
| `shared.json` | `Nav`, `Footer`, `dashboardNav`, `NotFound`, test empty state |
| `marketing.json` | Landing, impact, technology, marketing navigation, scroll sections, site footer |
| `legal-support.json` | Terms, privacy, help, contact, download, post-intervention |
| `auth.json` | Login, registration, password recovery, group creation, partner invitation |
| `accountability.json` | Approval states/forms, approval routes, accountability and partner workspaces |
| `recovery.json` | Recovery dashboard/hub, weekly review, education library |
| `account.json` | Settings, support, profile, data requests |
| `operations.json` | Administration and synthetic research sandbox |

When adding or moving translations:

1. Keep a namespace in exactly one module.
2. Make the same module and nested key changes under `id/` and `en/`.
3. If adding a module, register its explicit import for both locales in
   `i18n/messages.ts`.
4. Run `npm run i18n:check`.

The validator rejects malformed JSON, non-string leaves, duplicate namespaces,
different module sets, and missing or extra nested keys between locales.
