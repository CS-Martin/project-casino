'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { OfferTypeBreakdownItem } from '@convex/offers/queries/getOfferTypeBreakdown';

interface UseOfferTypeBreakdownReturn {
  breakdown: OfferTypeBreakdownItem[] | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for offer type breakdown data fetching
 * Shows distribution of offer types across active offers
 */
export const useOfferTypeBreakdown = (): UseOfferTypeBreakdownReturn => {
  const breakdown = useQuery(api.offers.index.getOfferTypeBreakdown);

  const isLoading = breakdown === undefined;
  const error = null; // Convex handles errors differently

  return {
    breakdown,
    isLoading,
    error,
  };
};
