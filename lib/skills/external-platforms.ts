export interface ExternalSkillPlatform {
  /** Stable slug used as the React key. */
  id: string;
  /** Platform name is a proper noun and stays untranslated. */
  name: string;
  url: string;
  /** Message key inside the `skillsHub` namespace. */
  descriptionKey: string;
}

/**
 * Turns a provider display name into a URL-safe slug used by the learning
 * direction cards and the `/skills/[providerSlug]` detail route.
 */
export function slugifyProvider(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Curated free-course and certification platforms for the skills page
 * (supporting feature around PKM-WEB-006 skill recommendations). Links open
 * in a new tab and never carry any account or browsing data. Edit this array
 * plus one `skillsHub.platform*` key pair per locale to change the list.
 */
export const EXTERNAL_SKILL_PLATFORMS: readonly ExternalSkillPlatform[] = [
  {
    id: 'dicoding',
    name: 'Dicoding',
    url: 'https://www.dicoding.com/',
    descriptionKey: 'platformDicoding',
  },
  {
    id: 'coursera',
    name: 'Coursera',
    url: 'https://www.coursera.org/courses?query=free',
    descriptionKey: 'platformCoursera',
  },
  {
    id: 'google_skillshop',
    name: 'Google Skillshop',
    url: 'https://skillshop.withgoogle.com/',
    descriptionKey: 'platformGoogleSkillshop',
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/',
    descriptionKey: 'platformFreeCodeCamp',
  },
  {
    id: 'siapkerja',
    name: 'SIAPkerja Kemnaker',
    url: 'https://siapkerja.kemnaker.go.id/',
    descriptionKey: 'platformSiapKerja',
  },
] as const;
