import { api } from '@convex/_generated/api';
import { usePaginatedQuery } from 'convex/react';
import { useMemo } from 'react';

export const useCasinoList = (numItems: number = 10) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.casinos.index.getCasinosPaginated,
    { paginationOpts: { numItems, cursor: null } },
    { initialNumItems: numItems }
  );

  const isLoading = status === 'LoadingFirstPage' || status === 'LoadingMore';
  const isLoadingInitial = status === 'LoadingFirstPage';
  const hasMore = status !== 'Exhausted';

  const casinos = useMemo(() => results, [results]);

  return { casinos, isLoading, isLoadingInitial, hasMore, loadMore };
};
