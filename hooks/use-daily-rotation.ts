'use client';

import { useSyncExternalStore } from 'react';

/**
 * Deterministic day-of-year index shared by every daily-rotating surface
 * (bite facts, Gami dialog variants, and myth-vs-fact). SSR renders
 * index 0; the client's local date swaps in right after hydration and stays
 * referentially stable for the session. No Math.random in render, ever.
 */
const subscribeNever = () => () => {};
let clientDayOfYear: number | null = null;
const getDayOfYearSnapshot = () => {
  if (clientDayOfYear === null) {
    const now = new Date();
    clientDayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
  }
  return clientDayOfYear;
};
const getDayOfYearServerSnapshot = () => 0;

export function useDayOfYear(): number {
  return useSyncExternalStore(
    subscribeNever,
    getDayOfYearSnapshot,
    getDayOfYearServerSnapshot
  );
}
