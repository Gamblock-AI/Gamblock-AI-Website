export const DASHBOARD_TOUR_KEY = 'gamblock:dashboard-tour:v1';

export function getDashboardTourSeen(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DASHBOARD_TOUR_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDashboardTourSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DASHBOARD_TOUR_KEY, '1');
  } catch {
    // Private mode / storage restrictions simply allow the tour again later.
  }
}
