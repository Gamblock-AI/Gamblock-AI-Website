import { apiClient } from './api-client';

export async function login(email: string, password: string) {
  return apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, name: string) {
  return apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}
