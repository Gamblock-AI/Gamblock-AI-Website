'use client';

import { useState } from 'react';
import { Play, ShieldAlert } from 'lucide-react';
import type { EducationVideo } from '@/hooks/use-education';
import { resolveEducationMediaURL, isExternalEducationMedia } from '@/components/education/media-url';

interface VideoGalleryProps {
  videos: EducationVideo[];
  mediaURLs: Record<string, string>;
  locale: string;
  onMediaOpened?: (mediaID: string) => void;
}

export function VideoGallery({
  videos,
  mediaURLs,
  locale,
  onMediaOpened,
}: VideoGalleryProps) {
  const [consented, setConsented] = useState<Record<string, boolean>>({});

  if (!videos || videos.length === 0) return null;

  const sorted = [...videos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div
      className={`grid gap-4 ${
        sorted.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'
      }`}
    >
      {sorted.map((video) => {
        const url = mediaURLs[video.media_id] ?? '';
        if (!url) return null;

        const external = isExternalEducationMedia(url);
        const consentedItem = consented[video.media_id] ?? false;
        const title = video.title?.[locale] ?? video.alt_text?.[locale] ?? '';
        const alt = video.alt_text?.[locale] ?? '';

        if (external && !consentedItem) {
          return (
            <div
              key={video.media_id}
              className="border-border bg-muted/30 flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border p-6"
            >
              <ShieldAlert className="text-navy/50 size-8" />
              <p className="text-muted-foreground text-center text-xs leading-relaxed">
                {locale === 'id'
                  ? 'Video ini berasal dari sumber eksternal. Klik untuk memuat.'
                  : 'This video is from an external source. Click to load.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setConsented((prev) => ({
                    ...prev,
                    [video.media_id]: true,
                  }));
                  onMediaOpened?.(video.media_id);
                }}
                className="bg-navy hover:bg-navy-light text-primary-foreground inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
              >
                <Play className="size-3.5" />
                {locale === 'id' ? 'Muat video' : 'Load video'}
              </button>
            </div>
          );
        }

        return (
          <div
            key={video.media_id}
            className="border-border overflow-hidden rounded-2xl border"
          >
            {external ? (
              <iframe
                src={url}
                title={alt}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => onMediaOpened?.(video.media_id)}
              />
            ) : (
              <video
                className="aspect-video w-full"
                controls
                preload="metadata"
                onPlay={() => onMediaOpened?.(video.media_id)}
              >
                <source src={resolveEducationMediaURL(url)} />
                {locale === 'id'
                  ? 'Browser ini tidak dapat memutar video.'
                  : 'This browser cannot play the video.'}
              </video>
            )}
            {title ? (
              <p className="text-navy px-4 py-2.5 text-sm font-semibold">
                {title}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
