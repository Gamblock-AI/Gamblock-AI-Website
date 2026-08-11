import { afterEach, describe, expect, it } from 'vitest';
import {
  GAMI_RECOMMENDATION_SEEN_KEY,
  getLastSeenGamiRecommendationID,
  setLastSeenGamiRecommendationID,
} from './gami-recommendation-storage';

afterEach(() => window.localStorage.clear());

describe('Gami recommendation storage', () => {
  it('stores only the last daily recommendation ID', () => {
    setLastSeenGamiRecommendationID('spk-daily-1');

    expect(getLastSeenGamiRecommendationID()).toBe('spk-daily-1');
    expect(window.localStorage).toHaveLength(1);
    expect(window.localStorage.getItem(GAMI_RECOMMENDATION_SEEN_KEY)).toBe(
      'spk-daily-1'
    );
  });

  it('ignores an empty recommendation ID', () => {
    setLastSeenGamiRecommendationID('');

    expect(getLastSeenGamiRecommendationID()).toBeNull();
  });
});
