'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface SiteSocialLink {
  id: string;
  platform: string;
  label: string;
  url: string | null;
  enabled: boolean;
  sort_order: number;
}

export function useSiteSocialLinks() {
  const [links, setLinks] = useState<SiteSocialLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void apiClient<SiteSocialLink[]>('/public/site-social-links')
      .then((items) => {
        if (!active) return;
        setLinks(items.filter((item) => item.enabled && item.url));
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setLinks([]);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { links, loaded };
}
