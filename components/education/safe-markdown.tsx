import type { ReactNode } from 'react';

type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'quote'; text: string };

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length) {
        const item = lines[cursor].trim().match(/^[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        cursor += 1;
      }
      blocks.push({ type: 'unordered-list', items });
      index = cursor - 1;
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length) {
        const item = lines[cursor].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        cursor += 1;
      }
      blocks.push({ type: 'ordered-list', items });
      index = cursor - 1;
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      blocks.push({ type: 'quote', text: line.slice(2).trim() });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] text-navy">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function SafeMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="space-y-5 text-[0.98rem] leading-8 text-foreground/85">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const className =
            block.level === 1
              ? 'pt-2 text-2xl font-extrabold tracking-tight text-navy'
              : block.level === 2
                ? 'pt-2 text-xl font-bold tracking-tight text-navy'
                : 'pt-1 text-lg font-bold text-navy';
          if (block.level === 1) {
            return <h2 key={index} className={className}>{renderInline(block.text)}</h2>;
          }
          if (block.level === 2) {
            return <h3 key={index} className={className}>{renderInline(block.text)}</h3>;
          }
          return <h4 key={index} className={className}>{renderInline(block.text)}</h4>;
        }

        if (block.type === 'unordered-list') {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6 marker:text-sage">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={index} className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-navy">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="rounded-r-2xl border-l-4 border-sage bg-sage/[0.055] px-5 py-4 text-navy">
              {renderInline(block.text)}
            </blockquote>
          );
        }

        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
