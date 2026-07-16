import { getRequestConfig } from 'next-intl/server';

import { isSupportedLocale, loadMessages } from './messages';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale =
    requestedLocale && isSupportedLocale(requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
