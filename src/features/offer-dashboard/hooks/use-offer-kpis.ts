'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { OfferKpis } from '@convex/offers/queries/getOfferKpis';

interface UseOfferKpisReturn {
  kpis: OfferKpis | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for offer dashboard KPI data fetching
 * Encapsulates offer KPI queries with loading states
 */
export const useOfferKpis = (): UseOfferKpisReturn => {
  const kpis = useQuery(api.offers.index.getOfferKpis);

  const isLoading = kpis === undefined;
  const error = null; // Convex handles errors differently

  return {
    kpis,
    isLoading,
    error,
  };
};
