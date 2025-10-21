'use client';

import { usePaginatedQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { CasinoWithOfferStats } from '@convex/casinos/queries/getCasinosWithOfferStats';
import { Id } from '@convex/_generated/dataModel';

interface UseCasinosWithOfferStatsParams {
  stateId?: Id<'states'>;
  status?: 'current' | 'stale' | 'missing' | 'all';
  pageSize?: number;
}

interface UseCasinosWithOfferStatsReturn {
  casinos: CasinoWithOfferStats[];
  isLoading: boolean;
  error: string | null;
  loadMore: (numItems: number) => void;
  status: 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';
}

/**
 * Custom hook for fetching paginated casinos with offer statistics
 * Shows research status, offer counts, and freshness indicators
 */
export const useCasinosWithOfferStats = (
  params: UseCasinosWithOfferStatsParams = {}
): UseCasinosWithOfferStatsReturn => {
  const { pageSize = 10 } = params;

  const { results, status, loadMore } = usePaginatedQuery(
    api.casinos.index.getCasinosWithOfferStats,
    {
      stateId: params.stateId,
      status: params.status,
    },
    { initialNumItems: pageSize }
  );

  const isLoading = status === 'LoadingFirstPage';
  const error = null; // Convex handles errors differently

  return {
    casinos: results ?? [],
    isLoading,
    error,
    loadMore,
    status,
  };
};
