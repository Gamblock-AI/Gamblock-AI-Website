import { describe, expect, it } from 'vitest';

import { shuffle } from './random';

describe('shuffle', () => {
  it('returns a deterministic shuffled copy without mutating the input', () => {
    const source = [1, 2, 3, 4];
    const result = shuffle(source, () => 0);

    expect(result).toEqual([2, 3, 4, 1]);
    expect(source).toEqual([1, 2, 3, 4]);
    expect(result).not.toBe(source);
  });

  it('keeps empty and single-item inputs intact', () => {
    expect(shuffle([], () => 0.5)).toEqual([]);
    expect(shuffle(['only'], () => 0.5)).toEqual(['only']);
  });
});
