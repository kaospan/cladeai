/**
 * React hooks for unified music search API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchParams, SearchResult, Track } from '@/types';
import { unifiedSearch } from '@/lib/unifiedSearch';

/**
 * Hook for searching tracks across all providers
 */
export function useUnifiedSearch(params: SearchParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search', params.query, params.market, params.limit],
    queryFn: () => unifiedSearch(params),
    enabled: enabled && !!params.query,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Hook for prefetching search results
 */
export function usePrefetchSearch() {
  const queryClient = useQueryClient();

  return (params: SearchParams) => {
    queryClient.prefetchQuery({
      queryKey: ['search', params.query, params.market, params.limit],
      queryFn: () => unifiedSearch(params),
      staleTime: 1000 * 60 * 15,
    });
  };
}
