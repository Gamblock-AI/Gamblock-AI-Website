export function isValidEducationSourceURL(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

const allowedRichTextNodes = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'horizontalRule',
  'hardBreak',
  'image',
  'video',
  'pdf',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
]);

const allowedRichTextMarks = new Set([
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'code',
]);

export function findEducationRichTextValidationError(
  value: unknown
): string | null {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (const child of value) {
      const error = findEducationRichTextValidationError(child);
      if (error) return error;
    }
    return null;
  }

  const node = value as Record<string, unknown>;
  if (typeof node.type === 'string' && !allowedRichTextNodes.has(node.type)) {
    return `Elemen rich text ${node.type} tidak didukung.`;
  }
  if (node.marks !== undefined) {
    if (!Array.isArray(node.marks)) return 'Format mark rich text tidak valid.';
    for (const mark of node.marks) {
      if (!mark || typeof mark !== 'object' || Array.isArray(mark)) {
        return 'Format mark rich text tidak valid.';
      }
      const markType = (mark as Record<string, unknown>).type;
      if (typeof markType !== 'string' || !allowedRichTextMarks.has(markType)) {
        return `Format mark rich text ${String(markType || 'unknown')} tidak didukung.`;
      }
    }
  }

  for (const [key, child] of Object.entries(node)) {
    // Marks have their own allowlist above; they are not ProseMirror nodes.
    if (key === 'marks') continue;
    const error = findEducationRichTextValidationError(child);
    if (error) return error;
  }
  return null;
}
