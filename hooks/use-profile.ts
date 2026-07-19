'use client';

import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface ProfileResponse {
  display_name: string;
  avatar_url?: string;
}

interface PasswordUpdateResponse {
  updated: boolean;
  reauth_required: boolean;
}

export function useProfileActions() {
  const updateDisplayName = useCallback(
    (displayName: string) =>
      apiClient<ProfileResponse>('/me', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: displayName }),
      }),
    []
  );

  const uploadAvatar = useCallback((avatar: File) => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return apiClient<ProfileResponse>('/me/avatar', {
      method: 'POST',
      body: formData,
    });
  }, []);

  const deleteAvatar = useCallback(
    () => apiClient<ProfileResponse>('/me/avatar', { method: 'DELETE' }),
    []
  );

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string) =>
      apiClient<PasswordUpdateResponse>('/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }),
    []
  );

  return { updateDisplayName, uploadAvatar, deleteAvatar, updatePassword };
}
