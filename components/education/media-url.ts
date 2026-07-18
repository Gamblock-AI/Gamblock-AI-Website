import { config } from '@/lib/config';

export function resolveEducationMediaURL(path?: string) {
  if (!path) return '';
  if (/^https:\/\//i.test(path)) return path;
  return `${config.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isExternalEducationMedia(path?: string) {
  return Boolean(path && /^https:\/\//i.test(path));
}
