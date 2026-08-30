export type QueryParamValue = string | number | null | undefined;

/** Flat dashboard keys from the pre-namespace browser URL contract. */
export const LEGACY_DASHBOARD_QUERY_KEYS = [
  'page',
  'tab',
  'channel',
  'range',
  'section',
  'q',
  'status',
  'category',
  'group',
  'groupId',
  'group_id',
  'protection',
  'type',
  'priority',
  'assignee',
  'dataStatus',
  'accountQ',
  'accountRole',
  'accountStatus',
  'auditQ',
  'auditAction',
] as const;

const DOT_NAMESPACE_SET = new Set(['tab', 'filter', 'page', 'lang', 'item']);

export function mergeQueryKeys(
  ...groups: ReadonlyArray<readonly string[]>
): string[] {
  return Array.from(new Set(groups.flat()));
}

/** Build a readable namespaced key such as filter.groups.status. */
export function namespacedQueryKey(
  namespace: string,
  ...segments: readonly string[]
) {
  return [namespace, ...segments].join('.');
}

/** Build the previous bracketed representation for URL compatibility checks. */
export function legacyNamespacedQueryKey(
  namespace: string,
  ...segments: readonly string[]
) {
  return [namespace, ...segments]
    .map((segment, index) => (index === 0 ? segment : `[${segment}]`))
    .join('');
}

/** Convert a supported legacy bracketed browser key to its dot representation. */
export function canonicalQueryKey(key: string) {
  const firstBracket = key.indexOf('[');
  if (firstBracket <= 0 || !key.endsWith(']')) return key;

  const namespace = key.slice(0, firstBracket);
  if (!DOT_NAMESPACE_SET.has(namespace)) return key;

  const suffix = key.slice(firstBracket);
  const segments = [...suffix.matchAll(/\[([^\[\]]+)\]/g)];
  if (
    segments.length === 0 ||
    segments.map((match) => match[0]).join('') !== suffix
  ) {
    return key;
  }

  return namespacedQueryKey(
    namespace,
    ...segments.map((match) => match[1])
  );
}

/**
 * Return a new query snapshot with legacy namespaced keys converted to dots.
 * Canonical keys win if a URL contains both representations.
 */
export function normalizeQueryParams(
  currentSearchParams: string | Pick<URLSearchParams, 'toString'>
) {
  const queryString =
    typeof currentSearchParams === 'string'
      ? currentSearchParams
      : currentSearchParams.toString();
  const source = new URLSearchParams(queryString);
  const canonicalKeys = new Set(
    [...source.keys()].filter((key) => canonicalQueryKey(key) === key)
  );
  const normalized = new URLSearchParams();

  for (const [key, value] of source.entries()) {
    const canonicalKey = canonicalQueryKey(key);
    if (canonicalKey !== key && canonicalKeys.has(canonicalKey)) continue;
    normalized.append(canonicalKey, value);
  }

  return normalized;
}

export function filterQueryKey(resource: string, field: string) {
  return namespacedQueryKey('filter', resource, field);
}

export function scopedFilterQueryKey(
  resource: string,
  scope: string,
  field: string
) {
  return namespacedQueryKey('filter', resource, scope, field);
}

export function stateQueryKey(namespace: string, resource: string) {
  return namespacedQueryKey(namespace, resource);
}

export function updateQueryURL(
  pathname: string,
  currentSearchParams: URLSearchParams,
  updates: Record<string, QueryParamValue> = {},
  removeKeys: readonly string[] = []
) {
  const params = normalizeQueryParams(currentSearchParams);

  for (const [key, value] of Object.entries(updates)) {
    const canonicalKey = canonicalQueryKey(key);
    if (value === null || value === undefined || value === '') {
      params.delete(canonicalKey);
    } else {
      params.set(canonicalKey, String(value));
    }
  }

  for (const key of removeKeys) params.delete(canonicalQueryKey(key));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
