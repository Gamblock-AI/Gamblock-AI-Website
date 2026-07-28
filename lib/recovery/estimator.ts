/**
 * "Yang kamu jaga" estimator. The baseline (hours and rupiah per week the old
 * habit used to take) is entered by the user and stored LOCAL-ONLY — it never
 * appears in any request body, mirroring the intentions-before-sync contract.
 * The computed value is an honest, clearly-labeled approximation derived from
 * active days in the selected snapshot range.
 */
export const ESTIMATOR_STORAGE_KEY = 'gamblock:estimator:v1';

export interface EstimatorBaseline {
  hoursPerWeek: number;
  rupiahPerWeek: number;
  updatedAt: string;
}

export function readEstimatorBaseline(): EstimatorBaseline | null {
  try {
    const raw = window.localStorage.getItem(ESTIMATOR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstimatorBaseline;
    if (
      typeof parsed.hoursPerWeek !== 'number' ||
      typeof parsed.rupiahPerWeek !== 'number' ||
      parsed.hoursPerWeek <= 0 ||
      parsed.rupiahPerWeek < 0
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeEstimatorBaseline(
  baseline: Omit<EstimatorBaseline, 'updatedAt'>
): void {
  try {
    window.localStorage.setItem(
      ESTIMATOR_STORAGE_KEY,
      JSON.stringify({ ...baseline, updatedAt: new Date().toISOString() })
    );
  } catch {
    // Memory-only sessions simply lose the baseline.
  }
}

export function clearEstimatorBaseline(): void {
  try {
    window.localStorage.removeItem(ESTIMATOR_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function computeSaved(
  baseline: Pick<EstimatorBaseline, 'hoursPerWeek' | 'rupiahPerWeek'>,
  activeDays: number
): { hours: number; rupiah: number } {
  return {
    hours: Math.round((baseline.hoursPerWeek / 7) * activeDays),
    rupiah: Math.round((baseline.rupiahPerWeek / 7) * activeDays),
  };
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}
