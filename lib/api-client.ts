const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('gamblock_access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const cleanPath = path.startsWith("/v1/") || path === "/healthz" || path === "/readyz" ? path : `/v1${path}`;
  
  const res = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && typeof window !== 'undefined' && !cleanPath.includes('/auth/refresh') && !cleanPath.includes('/auth/login')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = localStorage.getItem('gamblock_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData?.data?.access_token) {
              localStorage.setItem('gamblock_access_token', refreshData.data.access_token);
              localStorage.setItem('gamblock_refresh_token', refreshData.data.refresh_token);
              document.cookie = `gamblock_access_token=${refreshData.data.access_token}; path=/; max-age=3600; SameSite=Lax`;
              isRefreshing = false;
              onRefreshed(refreshData.data.access_token);
            } else {
              throw new Error('Invalid refresh response');
            }
          } else {
            throw new Error('Refresh failed');
          }
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem('gamblock_access_token');
          localStorage.removeItem('gamblock_refresh_token');
          localStorage.removeItem('gamblock_user');
          document.cookie = 'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          window.location.href = '/login';
          throw err;
        }
      } else {
        localStorage.removeItem('gamblock_access_token');
        localStorage.removeItem('gamblock_refresh_token');
        localStorage.removeItem('gamblock_user');
        document.cookie = 'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        window.location.href = '/login';
        throw new Error('No refresh token available');
      }
    }

    return new Promise<T>((resolve) => {
      subscribeTokenRefresh((newToken) => {
        const retriedHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };
        resolve(
          fetch(`${API_URL}${cleanPath}`, {
            ...options,
            headers: retriedHeaders,
            credentials: 'include',
          }).then(async (r) => {
            if (!r.ok) throw new Error(`API error after retry: ${r.status}`);
            const json = await r.json();
            return json && typeof json === 'object' && 'data' in json ? json.data : json;
          }) as Promise<T>
        );
      });
    });
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}
