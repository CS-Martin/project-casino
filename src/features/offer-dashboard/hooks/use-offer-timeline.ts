'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { OfferTimelineDataPoint } from '@convex/offers/queries/getOfferTimeline';

interface UseOfferTimelineReturn {
  timeline: OfferTimelineDataPoint[] | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for offer timeline data fetching
 * Fetches new offers and expired offers over time
 */
export const useOfferTimeline = (timeRange?: '7d' | '30d' | '90d'): UseOfferTimelineReturn => {
  const timeline = useQuery(api.offers.index.getOfferTimeline, { timeRange });

  const isLoading = timeline === undefined;
  const error = null; // Convex handles errors differently

  return {
    timeline,
    isLoading,
    error,
  };
};
