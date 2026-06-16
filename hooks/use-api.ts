import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<T | null>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApiQuery<T>(
  path: string,
  autoFetch = true
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient<T>(path);
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      setLoading(false);
      return null;
    }
  }, [path]);

  useEffect(() => {
    if (autoFetch) {
      setTimeout(() => {
        refetch();
      }, 0);
    }
  }, [autoFetch, refetch]);

  return { data, loading, error, refetch, setData };
}

export interface UseMutationResult<TVariables, TData> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
}

export function useApiMutation<TVariables = unknown, TData = unknown>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): UseMutationResult<TVariables, TData> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient<TData>(path, {
          method,
          body: variables ? JSON.stringify(variables) : undefined,
        });
        setLoading(false);
        return result;
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        setError(errorObject);
        setLoading(false);
        throw errorObject;
      }
    },
    [path, method]
  );

  return { mutate, loading, error };
}
