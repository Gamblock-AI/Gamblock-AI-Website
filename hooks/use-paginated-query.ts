'use client';

import { useMemo } from 'react';
import { useApiQuery } from './use-api';
import {
  usePagination,
  type PaginatedData,
  type UsePaginationResult,
} from './use-pagination';

function withPagination(path: string, page: number, limit: number) {
  const [base, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return `${base}?${params.toString()}`;
}

export interface UsePaginatedQueryResult<
  T,
  TData extends PaginatedData<T> = PaginatedData<T>,
> {
  items: T[];
  data: TData | null;
  pagination: UsePaginationResult<T>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<TData | null>;
}

export function usePaginatedQuery<
  T,
  TData extends PaginatedData<T> = PaginatedData<T>,
>({
  path,
  pageKey,
  pageSize,
  initialPage = 1,
}: {
  path: string;
  pageKey: string;
  pageSize: number;
  initialPage?: number;
}): UsePaginatedQueryResult<T, TData> {
  const paginationState = usePagination({
    pageKey,
    pageSize,
    initialPage,
  });
  const requestPath = useMemo(
    () => withPagination(path, paginationState.page, pageSize),
    [pageSize, paginationState.page, path]
  );
  const query = useApiQuery<TData>(requestPath);
  const data = query.data;
  const pagination = usePagination({
    items: data?.items ?? [],
    totalItems: data?.total_count ?? 0,
    totalPages: data?.total_pages,
    hasMore: data?.has_more,
    pageSize: data?.page_size ?? pageSize,
    initialPage,
    pageKey,
  });

  return {
    items: data?.items ?? [],
    data,
    pagination,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}
