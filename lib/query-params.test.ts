import { describe, expect, it } from 'vitest';
import {
  canonicalQueryKey,
  filterQueryKey,
  legacyNamespacedQueryKey,
  namespacedQueryKey,
  normalizeQueryParams,
  scopedFilterQueryKey,
  stateQueryKey,
  updateQueryURL,
} from './query-params';

describe('query-param naming', () => {
  it('builds namespaced keys with dots', () => {
    expect(namespacedQueryKey('filter', 'tickets', 'status')).toBe(
      'filter.tickets.status'
    );
    expect(filterQueryKey('supportHistory', 'q')).toBe(
      'filter.supportHistory.q'
    );
    expect(scopedFilterQueryKey('groupMembers', 'group-1', 'q')).toBe(
      'filter.groupMembers.group-1.q'
    );
    expect(stateQueryKey('page', 'support')).toBe('page.support');
  });

  it('converts supported legacy bracket keys, including nested scopes', () => {
    expect(
      canonicalQueryKey(legacyNamespacedQueryKey('tab', 'support'))
    ).toBe('tab.support');
    expect(
      canonicalQueryKey(
        legacyNamespacedQueryKey('page', 'groupMembers', 'group-1')
      )
    ).toBe('page.groupMembers.group-1');
    expect(canonicalQueryKey('custom[key]')).toBe('custom[key]');
  });

  it('normalizes legacy keys while preferring canonical values', () => {
    const normalized = normalizeQueryParams(
      new URLSearchParams(
        'tab%5Bsupport%5D=partner&tab.support=team&filter%5Btickets%5D%5Bstatus%5D=open&status=unrelated'
      )
    );

    expect(normalized.toString()).toBe(
      'tab.support=team&filter.tickets.status=open&status=unrelated'
    );
  });

  it('writes readable dot keys and preserves normal value encoding', () => {
    const url = updateQueryURL(
      '/support',
      new URLSearchParams('tab%5Bsupport%5D=partner&page.audit=2'),
      { 'filter.supportHistory.q': 'hello world' }
    );

    expect(url).toBe(
      '/support?tab.support=partner&page.audit=2&filter.supportHistory.q=hello+world'
    );
  });
});
