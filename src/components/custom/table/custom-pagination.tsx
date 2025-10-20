import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ Add this import

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    hasMore?: boolean;
    pageSize: number;
    totalItems: number;
    isLoading?: boolean;
}

export function CustomPagination({
    currentPage,
    totalPages,
    onPageChange,
    onPrevious,
    onNext,
    hasMore = false,
    pageSize,
    totalItems,
    isLoading = false
}: CustomPaginationProps) {
    const renderPaginationItems = () => {
        if (isLoading) {
            return Array.from({ length: 10 }).map((_, i) => (
                <PaginationItem key={i}>
                    <Skeleton className="h-9 w-9 rounded-md" />
                </PaginationItem>
            ));
        }

        const items = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => onPageChange(i)}
                            isActive={i === currentPage}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // Always show first page
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={() => onPageChange(1)}
                        isActive={1 === currentPage}
                        className="cursor-pointer"
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            // Show ellipsis after first page if current page is far from start
            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Calculate range of pages to show around current page
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the start
            if (currentPage <= 3) {
                endPage = Math.min(totalPages - 1, 4);
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3);
            }

            // Show middle pages
            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => onPageChange(i)}
                            isActive={i === currentPage}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            // Show ellipsis before last page if current page is far from end
            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Always show last page
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => onPageChange(totalPages)}
                        isActive={totalPages === currentPage}
                        className="cursor-pointer"
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="flex items-center justify-between w-full mt-6">
            {/* Page size info - left side */}
            <div className="text-sm text-muted-foreground">
                {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                ) : (
                    `Page ${currentPage} of ${totalPages} • ${pageSize} items per page`
                )}
            </div>

            {/* Pagination controls - right side */}
            <div className="flex justify-end">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={onPrevious}
                                className={
                                    currentPage === 1 || isLoading
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                            <PaginationNext
                                onClick={onNext}
                                className={
                                    (currentPage >= totalPages && !hasMore) || isLoading
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}