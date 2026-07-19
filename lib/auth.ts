import { apiClient } from './api-client';

export async function login(email: string, password: string) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: 'user' | 'partner'
) {
  return apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function loginWithGoogle(
  idToken: string,
  role?: 'user' | 'partner'
) {
  return apiClient('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken, role }),
  });
}

export function persistAuthSession(response: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: unknown;
}) {
  localStorage.setItem('gamblock_access_token', response.access_token);
  localStorage.setItem('gamblock_refresh_token', response.refresh_token);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `gamblock_access_token=${response.access_token}; path=/; max-age=${response.expires_in || 3600}; SameSite=Lax${secure}`;
  localStorage.setItem('gamblock_user', JSON.stringify(response.user));
}

export async function logout(refreshToken: string) {
  return apiClient('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
