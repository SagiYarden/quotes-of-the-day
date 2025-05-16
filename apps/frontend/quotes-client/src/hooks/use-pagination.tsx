import { PaginatedResponse } from '@monorepo/quotes-interfaces';
import { useCallback, useEffect, useState, useRef } from 'react';

export type UsePaginationOptions<T> = {
  fetchFn: (params: {
    page: number;
    pageSize: number;
  }) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  autoFetch?: boolean;
};

export const usePagination = <T,>({
  fetchFn,
  pageSize = 25,
  autoFetch = true,
}: UsePaginationOptions<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const initialLoadDone = useRef(false);

  const fetchPage = useCallback(
    async (pageToFetch: number) => {
      if (loading) return;

      setLoading(true);
      setError(false);
      try {
        const response = await fetchFn({ page: pageToFetch, pageSize });
        const newItems = response.items;

        setItems((prev) =>
          pageToFetch === 1 ? newItems : [...prev, ...newItems]
        );

        setHasMore(response.pagination.hasMore);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, pageSize, loading]
  );

  // Handle initial load - use a ref to track if we've already loaded
  useEffect(() => {
    if (autoFetch && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchPage(1);
    }
  }, [autoFetch, fetchPage]);

  // Load more function
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage);
  }, [page, loading, hasMore, fetchPage]);

  // Reset function
  const reset = useCallback(() => {
    initialLoadDone.current = false;
    setPage(1);
    setItems([]);
    fetchPage(1);
  }, [fetchPage]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    page,
  };
};
