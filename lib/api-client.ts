import { config } from './config';
import { ApiError } from './api-error';

/** Extract the current locale prefix from the browser URL. */
function getCurrentLocalePrefix(): string {
  if (typeof window === 'undefined') return '/id';
  const match = window.location.pathname.match(/^\/(id|en)/);
  return match ? `/${match[1]}` : '/id';
}

const API_URL = config.apiUrl;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Parse a failed response body into the backend envelope's error code/message
// (shape: { data, error: { code, message }, request_id }) and throw an ApiError
// that carries the production-safe message. Callers should catch ApiError and
// surface `error.friendly()` (or the friendlyMessage() helper) to users.
async function throwApiError(res: Response): Promise<never> {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const json = await res.json();
    if (json && typeof json === 'object' && 'error' in json) {
      const err = (json as { error?: { code?: string; message?: string } }).error;
      code = err?.code;
      message = err?.message;
    }
  } catch {
    // Non-JSON body (e.g. gateway error); fall back to status-based message.
  }
  throw new ApiError(res.status, code, message);
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
              document.cookie = `gamblock_access_token=${refreshData.data.access_token}; path=/; max-age=3600; SameSite=Lax; Secure`;
              isRefreshing = false;
              onRefreshed(refreshData.data.access_token);
            } else {
              throw new ApiError(401, 'invalid_refresh_token', 'Invalid refresh response');
            }
          } else {
            throw new ApiError(401, 'invalid_refresh_token', 'Refresh failed');
          }
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem('gamblock_access_token');
          localStorage.removeItem('gamblock_refresh_token');
          localStorage.removeItem('gamblock_user');
          document.cookie = 'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
          window.location.href = `${getCurrentLocalePrefix()}/login`;
          throw err instanceof ApiError ? err : new ApiError(401, 'invalid_refresh_token');
        }
      } else {
        localStorage.removeItem('gamblock_access_token');
        localStorage.removeItem('gamblock_refresh_token');
        localStorage.removeItem('gamblock_user');
        document.cookie = 'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        window.location.href = `${getCurrentLocalePrefix()}/login`;
        throw new ApiError(401, 'refresh_token_required');
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
            if (!r.ok) await throwApiError(r);
            const json = await r.json();
            return json && typeof json === 'object' && 'data' in json ? json.data : json;
          }) as Promise<T>
        );
      });
    });
  }

  if (!res.ok) await throwApiError(res);
  const json = await res.json();
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}
