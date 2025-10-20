import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

interface CasinoStats {
  total: number;
  tracked: number;
  untracked: number;
  coverageGapPercentage: number;
}

interface StateStats {
  state: string;
  tracked: number;
  untracked: number;
  total: number;
}

interface UseDashboardStatsReturn {
  casinoStats: CasinoStats | undefined;
  casinoStateStats: StateStats[] | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for dashboard statistics data fetching
 * Encapsulates casino stats and state stats queries with loading states
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const casinoStats = useQuery(api.casinos.index.getCasinoStats);
  const casinoStateStats = useQuery(api.casinos.index.getCasinosByStateStats);

  const isLoading = casinoStats === undefined || casinoStateStats === undefined;
  const error = null; // Convex handles errors differently

  return {
    casinoStats,
    casinoStateStats,
    isLoading,
    error,
  };
};
