import { ApiError } from './api-error';
import { config } from './config';
import { reportDevelopmentError } from './diagnostics';

const API_URL = config.apiUrl;
let refreshPromise: Promise<string> | null = null;

function getCurrentLocalePrefix(): string {
  if (typeof window === 'undefined') return '/id';
  const match = window.location.pathname.match(/^\/(id|en)/);
  return match ? `/${match[1]}` : '/id';
}

function clearBrowserSession() {
  localStorage.removeItem('gamblock_access_token');
  localStorage.removeItem('gamblock_refresh_token');
  localStorage.removeItem('gamblock_user');
  document.cookie =
    'gamblock_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

function persistAccessCookie(token: string, expiresIn = 3600) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `gamblock_access_token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax${secure}`;
}

async function throwApiError(response: Response): Promise<never> {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const json = await response.json();
    if (json && typeof json === 'object' && 'error' in json) {
      const error = (
        json as {
          error?: { code?: string; message?: string };
        }
      ).error;
      code = error?.code;
      message = error?.message;
    }
  } catch {
    // Gateways can return non-JSON bodies; status-based messaging remains safe.
  }
  throw new ApiError(response.status, code, message);
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  if (!response.ok) await throwApiError(response);
  const json = await response.json();
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('gamblock_refresh_token');
    if (!refreshToken) throw new ApiError(401, 'refresh_token_required');

    const response = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const payload = await unwrapResponse<{
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    }>(response);
    if (!payload.access_token || !payload.refresh_token) {
      throw new ApiError(401, 'invalid_refresh_token');
    }

    localStorage.setItem('gamblock_access_token', payload.access_token);
    localStorage.setItem('gamblock_refresh_token', payload.refresh_token);
    persistAccessCookie(payload.access_token, payload.expires_in);
    return payload.access_token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function performApiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gamblock_access_token')
      : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  const cleanPath =
    path.startsWith('/v1/') || path === '/healthz' || path === '/readyz'
      ? path
      : `/v1${path}`;

  const response = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const canRefresh =
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !cleanPath.includes('/auth/refresh') &&
    !cleanPath.includes('/auth/login');
  if (!canRefresh) return unwrapResponse<T>(response);

  try {
    const newToken = await refreshAccessToken();
    const retriedResponse = await fetch(`${API_URL}${cleanPath}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
      credentials: 'include',
    });
    return await unwrapResponse<T>(retriedResponse);
  } catch (error) {
    clearBrowserSession();
    window.location.href = `${getCurrentLocalePrefix()}/login`;
    throw error instanceof ApiError
      ? error
      : new ApiError(401, 'invalid_refresh_token');
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    return await performApiRequest<T>(path, options);
  } catch (error) {
    reportDevelopmentError('API request failed', error, {
      method: options?.method ?? 'GET',
    });
    throw error;
  }
}
