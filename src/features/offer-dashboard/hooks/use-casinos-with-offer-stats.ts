'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { CasinoWithOfferStats } from '@convex/casinos/queries/getCasinosWithOfferStats';
import { Id } from '@convex/_generated/dataModel';

interface UseCasinosWithOfferStatsParams {
  stateId?: Id<'states'>;
  status?: 'current' | 'stale' | 'missing' | 'all';
}

interface UseCasinosWithOfferStatsReturn {
  casinos: CasinoWithOfferStats[] | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching casinos with offer statistics
 * Shows research status, offer counts, and freshness indicators
 */
export const useCasinosWithOfferStats = (
  params: UseCasinosWithOfferStatsParams = {}
): UseCasinosWithOfferStatsReturn => {
  const casinos = useQuery(
    api.casinos.index.getCasinosWithOfferStats,
    params.stateId || params.status
      ? {
          stateId: params.stateId,
          status: params.status,
        }
      : {}
  );

  const isLoading = casinos === undefined;
  const error = null; // Convex handles errors differently

  return {
    casinos,
    isLoading,
    error,
  };
};
