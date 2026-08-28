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

export function mergeQueryKeys(
  ...groups: ReadonlyArray<readonly string[]>
): string[] {
  return Array.from(new Set(groups.flat()));
}

/** Build a literal bracketed key such as filter[groups][status]. */
export function namespacedQueryKey(
  namespace: string,
  ...segments: readonly string[]
) {
  return [namespace, ...segments]
    .map((segment, index) => (index === 0 ? segment : `[${segment}]`))
    .join('');
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
  const params = new URLSearchParams(currentSearchParams.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  for (const key of removeKeys) params.delete(key);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
