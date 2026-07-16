import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

type MessageCatalog = {
  [namespace: string]: string | MessageCatalog;
};

type CatalogModule = {
  default: MessageCatalog;
};

type CatalogLoader = () => Promise<CatalogModule>;

// Keep imports explicit so Turbopack can determine every server-side catalog
// dependency at build time. Files load concurrently to avoid an import
// waterfall while preserving the existing next-intl namespace shape.
const catalogLoaders = {
  id: [
    () => import('../messages/id/shared.json'),
    () => import('../messages/id/marketing.json'),
    () => import('../messages/id/legal-support.json'),
    () => import('../messages/id/auth.json'),
    () => import('../messages/id/accountability.json'),
    () => import('../messages/id/recovery.json'),
    () => import('../messages/id/account.json'),
    () => import('../messages/id/operations.json'),
  ],
  en: [
    () => import('../messages/en/shared.json'),
    () => import('../messages/en/marketing.json'),
    () => import('../messages/en/legal-support.json'),
    () => import('../messages/en/auth.json'),
    () => import('../messages/en/accountability.json'),
    () => import('../messages/en/recovery.json'),
    () => import('../messages/en/account.json'),
    () => import('../messages/en/operations.json'),
  ],
} satisfies Record<Locale, readonly CatalogLoader[]>;

export function isSupportedLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

export async function loadMessages(locale: Locale): Promise<MessageCatalog> {
  const modules = await Promise.all(
    catalogLoaders[locale].map((loadCatalog) => loadCatalog())
  );
  const messages: MessageCatalog = {};

  for (const { default: catalog } of modules) {
    for (const [namespace, value] of Object.entries(catalog)) {
      if (namespace in messages) {
        throw new Error(`Duplicate message namespace: ${namespace}`);
      }
      messages[namespace] = value;
    }
  }

  return messages;
}
