import { apiClient } from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  phone_e164?: string;
  phone_verified_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthUser;
  verification_required?: boolean;
  verification_token?: string;
  phone_verification_preview_code?: string;
  password_enabled?: boolean;
  password_change_required?: boolean;
  password_change_token?: string;
}

export async function login(email: string, password: string) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function completeInitialPasswordChange(
  token: string,
  newPassword: string
) {
  return apiClient('/auth/first-login/password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: 'user' | 'partner',
  phone: string
) {
  return apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role, phone }),
  });
}

export function persistAuthSession(response: AuthResponse) {
  if (typeof window === 'undefined') return;
  if (!response.access_token || !response.refresh_token) return;
  localStorage.setItem('gamblock_access_token', response.access_token);
  localStorage.setItem('gamblock_refresh_token', response.refresh_token);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `gamblock_access_token=${response.access_token}; path=/; max-age=${response.expires_in || 3600}; SameSite=Lax${secure}`;
  if (response.user) {
    localStorage.setItem('gamblock_user', JSON.stringify(response.user));
  } else {
    localStorage.removeItem('gamblock_user');
  }
}

export async function logout(refreshToken: string) {
  return apiClient('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// WhatsApp OTP verification context. The verification token is short-lived and
// session-scoped so it is never exposed in the URL or persisted across tabs.
const VERIFICATION_CONTEXT_KEY = 'gamblock:phone-verification';

export interface VerificationContext {
  token: string;
  phone: string;
  previewCode: string;
}

export function beginVerificationFlow(response: AuthResponse) {
  if (!response.verification_token) return;
  if (typeof window === 'undefined') return;
  const context: VerificationContext = {
    token: response.verification_token,
    phone: response.user?.phone_e164 ?? '',
    previewCode: response.phone_verification_preview_code ?? '',
  };
  window.sessionStorage.setItem(
    VERIFICATION_CONTEXT_KEY,
    JSON.stringify(context)
  );
  cachedVerificationRaw = undefined;
}

let cachedVerificationRaw: string | null | undefined;
let cachedVerificationContext: VerificationContext | null = null;

function parseVerificationContext(
  raw: string | null
): VerificationContext | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<VerificationContext>;
    if (typeof parsed.token === 'string' && parsed.token) {
      return {
        token: parsed.token,
        phone: parsed.phone ?? '',
        previewCode: parsed.previewCode ?? '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function readVerificationContext(): VerificationContext | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(VERIFICATION_CONTEXT_KEY);
  if (raw === cachedVerificationRaw) return cachedVerificationContext;
  cachedVerificationRaw = raw;
  cachedVerificationContext = parseVerificationContext(raw);
  return cachedVerificationContext;
}

export function subscribeVerificationContext(listener: () => void): () => void {
  // sessionStorage is per-tab and only cleared right before the page navigates
  // away, so no storage listener is required.
  void listener;
  return () => undefined;
}

export function clearVerificationContext() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(VERIFICATION_CONTEXT_KEY);
  cachedVerificationRaw = undefined;
  cachedVerificationContext = null;
}
