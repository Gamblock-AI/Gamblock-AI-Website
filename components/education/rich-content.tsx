'use client';

import { type ReactNode, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import type { RichTextDocument } from '@/hooks/use-education';
import {
  isExternalEducationMedia,
  resolveEducationMediaURL,
} from './media-url';

export interface MediaLabels {
  externalTitle: string;
  externalBody: string;
  externalAction: string;
  videoUnsupported: string;
  pdfDocument: string;
  pdfOpen: string;
}

const DEFAULT_MEDIA_LABELS: MediaLabels = {
  externalTitle: 'External content',
  externalBody: 'Open only if you agree to connect to this provider.',
  externalAction: 'Load external content',
  videoUnsupported: 'This browser cannot play the video.',
  pdfDocument: 'PDF document',
  pdfOpen: 'Open in a new tab',
};

function markedText(node: RichTextDocument): ReactNode {
  let value: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') value = <strong>{value}</strong>;
    if (mark.type === 'italic') value = <em>{value}</em>;
    if (mark.type === 'underline') value = <u>{value}</u>;
    if (mark.type === 'strike') value = <s>{value}</s>;
    if (mark.type === 'code') value = <code>{value}</code>;
    if (mark.type === 'link') {
      const href = String(mark.attrs?.href ?? '');
      value = /^https:\/\//i.test(href) ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-blue-700 underline underline-offset-4"
        >
          {value}
        </a>
      ) : (
        value
      );
    }
  }
  return value;
}

function ConsentMedia({
  mediaID,
  url,
  type,
  alt,
  onOpened,
  labels,
}: {
  mediaID: string;
  url: string;
  type: 'image' | 'video' | 'pdf';
  alt: string;
  onOpened?: (mediaID: string) => void;
  labels: MediaLabels;
}) {
  const external = isExternalEducationMedia(url);
  const [allowed, setAllowed] = useState(!external);
  const src = resolveEducationMediaURL(url);

  if (!allowed) {
    return (
      <div className="my-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
        <ExternalLink
          className="mx-auto size-6 text-blue-700"
          aria-hidden="true"
        />
        <p className="text-navy mt-2 text-sm font-semibold">
          {labels.externalTitle}
        </p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {labels.externalBody}
        </p>
        <button
          type="button"
          onClick={() => {
            setAllowed(true);
            onOpened?.(mediaID);
          }}
          className="bg-navy hover:bg-navy/90 focus-visible:ring-navy/30 mt-3 min-h-11 rounded-xl px-4 text-sm font-bold text-white outline-none focus-visible:ring-2"
        >
          {labels.externalAction}
        </button>
      </div>
    );
  }

  if (type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="border-border my-5 w-full rounded-2xl border object-cover"
        onLoad={() => onOpened?.(mediaID)}
      />
    );
  }
  if (type === 'video') {
    if (external) {
      return (
        <iframe
          src={src}
          title={alt || 'Video'}
          className="border-border bg-navy my-5 aspect-video w-full rounded-2xl border"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => onOpened?.(mediaID)}
        />
      );
    }
    return (
      <video
        className="bg-navy my-5 aspect-video w-full rounded-2xl"
        controls
        preload="metadata"
        onPlay={() => onOpened?.(mediaID)}
      >
        <source src={src} />
        {labels.videoUnsupported}
      </video>
    );
  }
  return (
    <div className="border-border my-5 overflow-hidden rounded-2xl border">
      <div className="bg-muted flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-navy inline-flex items-center gap-2 text-sm font-bold">
          <FileText className="size-4" />
          {alt || labels.pdfDocument}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          onClick={() => onOpened?.(mediaID)}
          className="text-xs font-semibold text-blue-700 underline"
        >
          {labels.pdfOpen}
        </a>
      </div>
      <iframe
        src={src}
        title={alt || 'PDF'}
        className="h-[32rem] w-full bg-white"
        onLoad={() => onOpened?.(mediaID)}
      />
    </div>
  );
}

function renderNode(
  node: RichTextDocument,
  key: string,
  mediaURLs: Record<string, string>,
  onMediaOpened?: (id: string) => void,
  labels: MediaLabels = DEFAULT_MEDIA_LABELS
): ReactNode {
  if (node.type === 'text') return <span key={key}>{markedText(node)}</span>;
  if (node.type === 'hardBreak') return <br key={key} />;
  const children = node.content?.map((child, index) =>
    renderNode(child, `${key}-${index}`, mediaURLs, onMediaOpened, labels)
  );
  switch (node.type) {
    case 'doc':
      return <div key={key}>{children}</div>;
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading': {
      const level = Math.min(4, Math.max(2, Number(node.attrs?.level ?? 2)));
      if (level === 2) return <h2 key={key}>{children}</h2>;
      if (level === 3) return <h3 key={key}>{children}</h3>;
      return <h4 key={key}>{children}</h4>;
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
    case 'codeBlock':
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} />;
    case 'image':
    case 'video':
    case 'pdf': {
      const mediaID = String(node.attrs?.media_id ?? '');
      if (!mediaID || !mediaURLs[mediaID]) return null;
      return (
        <ConsentMedia
          key={key}
          mediaID={mediaID}
          url={mediaURLs[mediaID]}
          type={node.type}
          alt={String(node.attrs?.alt ?? '')}
          onOpened={onMediaOpened}
          labels={labels}
        />
      );
    }
    default:
      return children ? <div key={key}>{children}</div> : null;
  }
}

export function RichContent({
  document,
  mediaURLs,
  onMediaOpened,
  labels = DEFAULT_MEDIA_LABELS,
}: {
  document: RichTextDocument;
  mediaURLs: Record<string, string>;
  onMediaOpened?: (mediaID: string) => void;
  labels?: MediaLabels;
}) {
  return (
    <div className="prose prose-slate prose-headings:text-navy prose-a:text-blue-700 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-li:marker:text-blue-700 max-w-none">
      {renderNode(document, 'root', mediaURLs, onMediaOpened, labels)}
    </div>
  );
}
