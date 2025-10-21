// hooks/use-paginated-data.ts
import { useState } from 'react';

interface UsePaginatedDataProps<T> {
  data: T[];
  pageSize: number;
  hasMore?: boolean;
  onLoadMore?: (itemsNeeded: number) => void;
}

export function usePaginatedData<T>({ data, pageSize, hasMore = false, onLoadMore }: UsePaginatedDataProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const totalLoaded = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalLoaded / pageSize));

  // Calculate the items to show for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = data?.slice(startIndex, endIndex) || [];

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);

    // Check if we need to load more data for this page
    const neededIndex = newPage * pageSize - 1;
    if (neededIndex >= totalLoaded && hasMore && onLoadMore) {
      setIsLoadingMore(true);
      const itemsNeeded = neededIndex - totalLoaded + 1;
      onLoadMore(itemsNeeded);
      setIsLoadingMore(false);
    }
  };

  const handleNextPage = async () => {
    // Make it async
    if (currentPage < totalPages) {
      await handlePageChange(currentPage + 1);
    } else if (hasMore && onLoadMore) {
      setIsLoadingMore(true);
      onLoadMore(pageSize);
      setCurrentPage(currentPage + 1);
      setIsLoadingMore(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentPageData,
    totalLoaded,
    isLoadingMore,
    handlePageChange,
    handleNextPage,
    handlePreviousPage,
    resetPagination,
  };
}
