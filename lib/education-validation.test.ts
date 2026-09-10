import { describe, expect, it } from 'vitest';
import {
  findEducationRichTextValidationError,
  isValidEducationSourceURL,
} from './education-validation';

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

describe('findEducationRichTextValidationError', () => {
  it('accepts italic as a text mark', () => {
    expect(
      findEducationRichTextValidationError({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Italic', marks: [{ type: 'italic' }] },
            ],
          },
        ],
      })
    ).toBeNull();
  });

  it('still rejects unsupported node types', () => {
    expect(
      findEducationRichTextValidationError({ type: 'iframe' })
    ).toBe('Elemen rich text iframe tidak didukung.');
  });
});
