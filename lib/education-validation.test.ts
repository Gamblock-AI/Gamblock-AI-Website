import { describe, expect, it } from 'vitest';
import { isValidEducationSourceURL } from './education-validation';

describe('isValidEducationSourceURL', () => {
  it('rejects the editor placeholder without a hostname', () => {
    expect(isValidEducationSourceURL('https://')).toBe(false);
  });

  it('accepts an HTTPS source with a hostname', () => {
    expect(isValidEducationSourceURL('https://example.com/reference')).toBe(
      true
    );
  });

  it('rejects non-HTTPS sources', () => {
    expect(isValidEducationSourceURL('http://example.com/reference')).toBe(
      false
    );
  });
});
