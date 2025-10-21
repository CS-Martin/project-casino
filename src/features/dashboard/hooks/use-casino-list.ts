import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { useMemo } from 'react';

interface CasinoListFilters {
  searchTerm?: string;
  stateId?: string;
  licenseStatus?: string;
  isTracked?: boolean;
}

export const useCasinoList = (numItems: number = 10, filters?: CasinoListFilters) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.casinos.index.getCasinosSearchable,
    {
      searchTerm: filters?.searchTerm,
      stateId: filters?.stateId as Id<'states'>,
      licenseStatus: filters?.licenseStatus,
      isTracked: filters?.isTracked,
    },
    { initialNumItems: numItems }
  );

  const isLoading = status === 'LoadingFirstPage' || status === 'LoadingMore';
  const isLoadingInitial = status === 'LoadingFirstPage';
  const hasMore = status !== 'Exhausted';

  const casinos = useMemo(() => results, [results]);

  return { casinos, isLoading, isLoadingInitial, hasMore, loadMore };
};
