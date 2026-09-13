'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export type DownloadPlatform = 'android' | 'windows' | 'browser_extension';

export interface LocalizedText {
  id: string;
  en: string;
}

export interface DownloadAsset {
  id: string;
  label: LocalizedText;
  file_name: string;
  url: string;
  size_bytes: number;
  sha256: string;
  primary: boolean;
}

export interface PublicDownloadApp {
  id: string;
  platform: DownloadPlatform;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  requirements: LocalizedText;
  architecture: LocalizedText;
  features: LocalizedText[];
  version: string;
  assets: DownloadAsset[];
  published: boolean;
}

export function usePublicDownloadApps() {
  const [data, setData] = useState<PublicDownloadApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchApps = useCallback(async () => {
    const items = await apiClient<PublicDownloadApp[]>('/public/download-apps');
    return items.filter((item) => item.published);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchApps());
    } catch (requestError) {
      setData([]);
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [fetchApps]);

  useEffect(() => {
    let active = true;
    void fetchApps()
      .then((items) => {
        if (active) setData(items);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setData([]);
        setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchApps]);

  return { data, loading, error, refetch };
}
