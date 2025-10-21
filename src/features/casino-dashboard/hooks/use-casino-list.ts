import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { useMemo, useState, useEffect } from 'react';

interface CasinoListFilters {
  searchTerm?: string;
  stateId?: string;
  licenseStatus?: string;
  isTracked?: boolean;
}

export const useCasinoList = (numItems: number = 10, filters?: CasinoListFilters) => {
  // Force re-fetch when page size changes by using a unique key
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [numItems]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.casinos.index.getCasinosSearchable as any,
    {
      searchTerm: filters?.searchTerm,
      stateId: filters?.stateId as Id<'states'>,
      licenseStatus: filters?.licenseStatus,
      isTracked: filters?.isTracked,
      // Use refreshKey to force new query instance
      _refresh: refreshKey,
    },
    { initialNumItems: numItems }
  );

  const isLoading = status === 'LoadingFirstPage' || status === 'LoadingMore';
  const isLoadingInitial = status === 'LoadingFirstPage';
  const hasMore = status !== 'Exhausted';

  const casinos = useMemo(() => results, [results]);

  return { casinos, isLoading, isLoadingInitial, hasMore, loadMore };
};
