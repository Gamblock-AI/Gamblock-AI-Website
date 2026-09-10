import { describe, expect, it } from 'vitest';
import { normalizeRichTextDocument } from './rich-content';
import type { RichTextDocument } from '@/hooks/use-education';

const listItem = (text: string): RichTextDocument => ({
  type: 'listItem',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

describe('normalizeRichTextDocument', () => {
  it('merges adjacent ordered lists so numbering continues', () => {
    const document: RichTextDocument = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          attrs: { start: 1 },
          content: [listItem('one')],
        },
        {
          type: 'orderedList',
          attrs: { start: 2 },
          content: [listItem('two')],
        },
        {
          type: 'orderedList',
          attrs: { start: 3 },
          content: [listItem('three')],
        },
      ],
    };

    const normalized = normalizeRichTextDocument(document);

    expect(normalized.content).toHaveLength(1);
    expect(normalized.content?.[0].content).toHaveLength(3);
  });

  it('keeps lists separated by content even when their start values differ', () => {
    const document: RichTextDocument = {
      type: 'doc',
      content: [
        { type: 'orderedList', content: [listItem('one')] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Break' }] },
        {
          type: 'orderedList',
          attrs: { start: 4 },
          content: [listItem('four')],
        },
      ],
    };

    const normalized = normalizeRichTextDocument(document);

    expect(normalized.content).toHaveLength(3);
  });
});
