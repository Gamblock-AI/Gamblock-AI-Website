'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import type { EducationThumbnail } from '@/hooks/use-education';
import { resolveEducationMediaURL } from './media-url';
import { useTranslations } from 'next-intl';

export function ThumbnailCarousel({
  thumbnails,
  urls,
  locale,
  title,
  compact = false,
}: {
  thumbnails: EducationThumbnail[];
  urls: Record<string, string>;
  locale: string;
  title: string;
  compact?: boolean;
}) {
  const t = useTranslations('educationLibrary');
  const items = useMemo(
    () => [...(thumbnails ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [thumbnails]
  );
  const [index, setIndex] = useState(0);
  const current = items[Math.min(index, Math.max(0, items.length - 1))];

  if (!current) {
    return (
      <div className="bg-azure/45 text-navy/45 flex aspect-video items-center justify-center">
        <ImageIcon className="size-8" aria-hidden="true" />
      </div>
    );
  }

  const alt = current.alt_text?.[locale] || current.alt_text?.id || title;
  return (
    <div className="bg-azure/40 relative overflow-hidden">
      {/* Backend image responses are authenticated by the same-site session. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveEducationMediaURL(urls[current.media_id])}
        alt={alt}
        className={`w-full object-cover ${compact ? 'aspect-[16/9]' : 'aspect-[16/8]'}`}
      />
      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() =>
              setIndex((value) => (value - 1 + items.length) % items.length)
            }
            className="bg-navy/80 hover:bg-navy absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={t('previousImage')}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % items.length)}
            className="bg-navy/80 hover:bg-navy absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={t('nextImage')}
          >
            <ChevronRight className="size-5" />
          </button>
          <span className="bg-navy/80 absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {index + 1}/{items.length}
          </span>
        </>
      ) : null}
    </div>
  );
}
