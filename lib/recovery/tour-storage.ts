export const DASHBOARD_TOUR_KEY = 'gamblock:dashboard-tour:v1';
export const PARTNER_TOUR_KEY = 'gamblock:partner-tour:v1';

export function getTourSeen(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function setTourSeen(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    // Private mode / storage restrictions simply allow the tour again later.
  }
}

export function getDashboardTourSeen(): boolean {
  return getTourSeen(DASHBOARD_TOUR_KEY);
}

export function setDashboardTourSeen(): void {
  setTourSeen(DASHBOARD_TOUR_KEY);
}

export function getPartnerTourSeen(): boolean {
  return getTourSeen(PARTNER_TOUR_KEY);
}
