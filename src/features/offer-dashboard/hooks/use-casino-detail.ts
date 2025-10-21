'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { CasinoDetailWithOffers } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import { Id } from '@convex/_generated/dataModel';

interface UseCasinoDetailReturn {
  casinoDetail: CasinoDetailWithOffers | null | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching detailed casino information with all offers
 */
export const useCasinoDetail = (casinoId: Id<'casinos'> | null): UseCasinoDetailReturn => {
  const casinoDetail = useQuery(api.casinos.index.getCasinoDetailWithOffers, casinoId ? { casinoId } : 'skip');

  const isLoading = casinoDetail === undefined;
  const error = null; // Convex handles errors differently

  return {
    casinoDetail,
    isLoading,
    error,
  };
};
