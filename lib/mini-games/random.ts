export type RandomSource = () => number;

/**
 * Return a shuffled copy without mutating the source collection.
 *
 * `rng` is injectable so game setup can be tested deterministically. Values
 * outside Math.random's normal [0, 1) range are clamped defensively.
 */
export function shuffle<T>(
  items: readonly T[],
  rng: RandomSource = Math.random
): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const sample = Math.min(Math.max(rng(), 0), 1 - Number.EPSILON);
    const swapIndex = Math.floor(sample * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
