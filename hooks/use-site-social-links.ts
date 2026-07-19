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

  useEffect(() => {
    let active = true;
    void apiClient<SiteSocialLink[]>('/public/site-social-links')
      .then((items) => {
        if (active) setLinks(items.filter((item) => item.enabled && item.url));
      })
      .catch(() => {
        if (active) setLinks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return links;
}
