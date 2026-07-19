'use client';

import { useEffect, useState } from 'react';
import { apiClientBlob } from '@/lib/api-client';

export function useAvatar(avatarUrl?: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarUrl) {
      setUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;
    void apiClientBlob(avatarUrl).then(
      (blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
      },
      () => {
        if (active) setUrl(null);
      }
    );

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarUrl]);

  return url;
}
