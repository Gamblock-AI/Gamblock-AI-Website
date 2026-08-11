export const GAMI_RECOMMENDATION_SEEN_KEY =
  'gamblock:gami-recommendation:last-seen-id:v1';

export function getLastSeenGamiRecommendationID(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(GAMI_RECOMMENDATION_SEEN_KEY);
  } catch {
    return null;
  }
}

export function setLastSeenGamiRecommendationID(
  recommendationID: string
): void {
  if (typeof window === 'undefined' || !recommendationID) return;
  try {
    window.localStorage.setItem(
      GAMI_RECOMMENDATION_SEEN_KEY,
      recommendationID
    );
  } catch {
    // Storage restrictions only mean the automatic greeting may return later.
  }
}
