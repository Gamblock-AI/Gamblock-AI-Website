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

export function clearBrowserSession() {
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

function currentRelativePath(): string {
  return `${window.location.pathname.replace(/^\/(id|en)(?=\/|$)/, '') || '/'}${window.location.search}`;
}

function redirectToLogin(nextPath = currentRelativePath()) {
  window.location.href = `${getCurrentLocalePrefix()}/login?next=${encodeURIComponent(nextPath)}`;
}

async function apiErrorFromResponse(response: Response): Promise<ApiError> {
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
  return new ApiError(response.status, code, message);
}

async function throwApiError(response: Response): Promise<never> {
  throw await apiErrorFromResponse(response);
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  if (!response.ok) await throwApiError(response);
  const json = await response.json();
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

async function unwrapBlobResponse(response: Response): Promise<Blob> {
  if (!response.ok) await throwApiError(response);
  return response.blob();
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
  options?: RequestInit,
  unwrap: (response: Response) => Promise<T> = unwrapResponse
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('gamblock_access_token')
      : null;
  const headers = new Headers(options?.headers);
  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

  if (response.status === 401 && typeof window !== 'undefined') {
    const authError = await apiErrorFromResponse(response.clone());
    if (authError.code === 'recent_auth_required') {
      // A recent-auth check protects a sensitive mutation, but it does not
      // invalidate the current session. Let the caller show its safe error
      // message instead of deleting the user's session and forcing a logout.
      throw authError;
    }
  }

  const canRefresh =
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !cleanPath.includes('/auth/refresh') &&
    !cleanPath.includes('/auth/login');
  if (!canRefresh) return unwrap(response);

  try {
    const newToken = await refreshAccessToken();
    const retriedResponse = await fetch(`${API_URL}${cleanPath}`, {
      ...options,
      headers: new Headers([
        ...headers.entries(),
        ['Authorization', `Bearer ${newToken}`],
      ]),
      credentials: 'include',
    });
    return await unwrap(retriedResponse);
  } catch (error) {
    clearBrowserSession();
    redirectToLogin();
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

export async function apiClientBlob(
  path: string,
  options?: RequestInit
): Promise<Blob> {
  try {
    return await performApiRequest(path, options, unwrapBlobResponse);
  } catch (error) {
    reportDevelopmentError('Binary API request failed', error, {
      method: options?.method ?? 'GET',
    });
    throw error;
  }
}
