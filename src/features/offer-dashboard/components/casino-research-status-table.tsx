'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableContainer } from '@/components/custom/table/table-container';
import { TableSkeleton } from '@/components/custom/table/table-skeleton';
import { CustomPagination } from '@/components/custom/table/custom-pagination';
import { PageSizeSelector } from '@/components/ui/page-size-selector';
import { CasinoResearchSearchFilters } from './casino-research-search-filters';
import { CasinoResearchActiveFilters } from './casino-research-active-filters';
import { useCasinosWithOfferStats } from '../hooks/use-casinos-with-offer-stats';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import { CasinoWithOfferStats } from '@convex/casinos/queries/getCasinosWithOfferStats';
import { Eye, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import CasinoDetailModal from './casino-detail-modal';
import { Id } from '@convex/_generated/dataModel';

type SortField = 'name' | 'state' | 'activeOffers' | 'lastCheck' | 'avgBonus';
type SortDirection = 'asc' | 'desc';

export default function CasinoResearchStatusTable() {
    const [pageSize, setPageSize] = React.useState(10);
    const [filters, setFilters] = React.useState({
        searchTerm: "",
        statusFilter: "all"
    });
    const [sortField, setSortField] = React.useState<SortField>('lastCheck');
    const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
    const [selectedCasinoId, setSelectedCasinoId] = React.useState<Id<'casinos'> | null>(null);
    const [modalOpen, setModalOpen] = React.useState(false);

    // Debounced search to reduce re-fetches
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.searchTerm), 300);
        return () => clearTimeout(timer);
    }, [filters.searchTerm]);

    // Fetch data from server with status filter
    const statusFilterValue = filters.statusFilter !== "all" ? filters.statusFilter as 'recent' | 'old' | 'never' : undefined;
    const { casinos, isLoading: isLoadingInitial, loadMore, status: paginationStatus } = useCasinosWithOfferStats({
        status: statusFilterValue || 'all',
        pageSize
    });

    const handleCasinoClick = (casinoId: string) => {
        setSelectedCasinoId(casinoId as Id<'casinos'>);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        // Delay clearing the selected casino to prevent flickering
        setTimeout(() => setSelectedCasinoId(null), 200);
    };

    // Filter and sort casinos (client-side)
    const filteredAndSortedCasinos = React.useMemo(() => {
        // First, apply search filter
        let filtered = [...casinos];

        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter((casino) => {
                return (
                    casino.name.toLowerCase().includes(searchLower) ||
                    casino.state.name.toLowerCase().includes(searchLower) ||
                    casino.state.abbreviation.toLowerCase().includes(searchLower) ||
                    casino.status.toLowerCase().includes(searchLower)
                );
            });
        }

        // Then, sort
        const sorted = filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'state':
                    comparison = a.state.abbreviation.localeCompare(b.state.abbreviation);
                    break;
                case 'activeOffers':
                    comparison = a.activeOffersCount - b.activeOffersCount;
                    break;
                case 'lastCheck':
                    if (a.lastOfferCheck === null && b.lastOfferCheck === null) return 0;
                    if (a.lastOfferCheck === null) return 1;
                    if (b.lastOfferCheck === null) return -1;
                    comparison = a.lastOfferCheck - b.lastOfferCheck;
                    break;
                case 'avgBonus':
                    comparison = a.avgBonusAmount - b.avgBonusAmount;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [casinos, debouncedSearch, sortField, sortDirection]);

    // Client-side pagination using the same hook as casino-list-table
    const hasMore = paginationStatus === 'CanLoadMore';
    const {
        currentPage,
        totalPages,
        currentPageData,
        totalLoaded,
        isLoadingMore,
        handlePageChange,
        handleNextPage,
        handlePreviousPage,
        resetPagination
    } = usePaginatedData({
        data: filteredAndSortedCasinos,
        pageSize,
        hasMore,
        onLoadMore: loadMore
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        resetPagination(); // Reset to page 1 when sorting
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        resetPagination(); // Reset to page 1 when changing page size
    };

    // Filter handlers
    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        resetPagination(); // Reset to page 1 when any filter changes
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: "",
            statusFilter: "all"
        });
        resetPagination(); // Reset to page 1 when clearing filters
    };

    const clearFilter = (key: string) => {
        setFilters((prev) => ({ ...prev, [key]: key === "searchTerm" ? "" : "all" }));
        resetPagination(); // Reset to page 1 when clearing individual filters
    };

    const getStatusBadge = (status: CasinoWithOfferStats['status']) => {
        switch (status) {
            case 'recent':
                return <Badge className="bg-green-500">✓ Recent</Badge>;
            case 'old':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600">⚠ Old</Badge>;
            case 'never':
                return <Badge variant="destructive">✕ Never</Badge>;
        }
    };

    const getTimeAgo = (timestamp: number | null) => {
        if (!timestamp) return 'Never';

        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <TableContainer
            title="Casino Research Status"
            description={
                isLoadingMore ? (
                    <div className="flex items-center gap-2">
                        <span>Loading more casinos...</span>
                        <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                    </div>
                ) : (
                    `Showing ${currentPageData.length} of ${totalLoaded} casinos${hasMore ? " (more available)" : ""}`
                )
            }
        >
            {/* Search Filters */}
            <CasinoResearchSearchFilters
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
            />

            {/* Active Filters */}
            <CasinoResearchActiveFilters
                filters={filters}
                onClearFilter={clearFilter}
            />

            {/* Table area */}
            <div className="rounded-md border">
                {isLoadingInitial ? (
                    <TableSkeleton
                        rows={pageSize}
                        columns={7}
                        columnWidths={["w-32", "w-16", "w-16", "w-20", "w-24", "w-20", "w-16"]}
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='px-0'>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('name')}
                                        className="h-8 w-full justify-start"
                                    >
                                        Casino Name
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className='px-0'>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('state')}
                                        className="h-8"
                                    >
                                        State
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className='px-0'>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('activeOffers')}
                                        className="h-8"
                                    >
                                        Offers
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className='px-0'>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('avgBonus')}
                                        className="h-8"
                                    >
                                        Avg Bonus
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className='px-0'>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('lastCheck')}
                                        className="h-8"
                                    >
                                        Last Check
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className='px-0 text-center'>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPageData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No casinos found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentPageData.map((casino) => (
                                    <TableRow
                                        key={casino._id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleCasinoClick(casino._id)}
                                    >
                                        <TableCell className="font-medium">{casino.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{casino.state.abbreviation}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span className="font-semibold">{casino.activeOffersCount}</span>
                                                {casino.historicalOffersCount > casino.activeOffersCount && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({casino.historicalOffersCount} total)
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {casino.avgBonusAmount > 0 ? (
                                                <span className="font-medium">${casino.avgBonusAmount}</span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{getTimeAgo(casino.lastOfferCheck)}</span>
                                                {casino.daysSinceLastCheck !== null && casino.daysSinceLastCheck > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({casino.daysSinceLastCheck}d)
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center'>{getStatusBadge(casino.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="View Details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCasinoClick(casino._id);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {casino.status !== 'recent' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title={casino.status === 'never' ? 'Research' : 'Update'}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {casino.status === 'never' ? (
                                                            <Search className="h-4 w-4" />
                                                        ) : (
                                                            <RefreshCw className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Page Size Selector and Summary Stats */}
            <div className="flex items-center justify-between py-4">
                <PageSizeSelector
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                />

                {/* Summary Stats */}
                <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Recent:</span>
                        <span className="sm:hidden">✓</span>
                        <span className="font-medium">{casinos.filter((c) => c.status === 'recent').length}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Old:</span>
                        <span className="sm:hidden">⚠</span>
                        <span className="font-medium">{casinos.filter((c) => c.status === 'old').length}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="hidden sm:inline">Never:</span>
                        <span className="sm:hidden">✕</span>
                        <span className="font-medium">{casinos.filter((c) => c.status === 'never').length}</span>
                    </span>
                </div>
            </div>

            {/* Pagination */}
            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
                hasMore={hasMore}
                pageSize={pageSize}
                totalItems={totalLoaded}
                isLoading={isLoadingMore}
            />

            {/* Casino Detail Modal */}
            <CasinoDetailModal
                casinoId={selectedCasinoId}
                open={modalOpen}
                onOpenChange={handleModalClose}
            />
        </TableContainer>
    );
}

