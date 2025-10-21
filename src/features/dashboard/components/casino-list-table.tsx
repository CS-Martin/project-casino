import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CasinoSearchFilters } from "./casino-search-filters";
import { CasinoActiveFilters } from "./casino-active-filters";
import { TableContainer } from "@/components/custom/table/table-container";
import { TableSkeleton } from "@/components/custom/table/table-skeleton";
import { CustomPagination } from "@/components/custom/table/custom-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useStates } from "../hooks/use-states";
import { useCasinoList } from "../hooks/use-casino-list";
import { usePaginatedData } from "@/hooks/use-paginated-data";

export function CasinoListTable() {
    const pageSize = 10;
    const { states } = useStates();

    // --- Filters stay stable across data fetches ---
    const [filters, setFilters] = useState({
        searchTerm: "",
        stateId: "all",
        licenseStatus: "all",
        trackedStatus: "all"
    });


    // --- Debounced search to reduce re-fetches ---
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.searchTerm), 300);
        return () => clearTimeout(timer);
    }, [filters.searchTerm]);

    const apiFilters = useMemo(() => ({
        searchTerm: debouncedSearch || undefined,
        stateId: filters.stateId !== "all" ? filters.stateId : undefined,
        licenseStatus: filters.licenseStatus !== "all" ? filters.licenseStatus : undefined,
        isTracked:
            filters.trackedStatus === "true"
                ? true
                : filters.trackedStatus === "false"
                    ? false
                    : undefined,
    }), [debouncedSearch, filters.stateId, filters.licenseStatus, filters.trackedStatus]);

    // --- Data fetching ---
    const { casinos, isLoadingInitial, hasMore, loadMore } = useCasinoList(pageSize, apiFilters);
    const {
        currentPage,
        totalPages,
        currentPageData,
        totalLoaded,
        isLoadingMore,
        handlePageChange,
        handleNextPage,
        handlePreviousPage
    } = usePaginatedData({
        data: casinos,
        pageSize,
        hasMore,
        onLoadMore: loadMore
    });

    // --- Filter handlers ---
    const updateFilter = (key: string, value: string) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const clearFilters = () =>
        setFilters({
            searchTerm: "",
            stateId: "all",
            licenseStatus: "all",
            trackedStatus: "all"
        });

    const clearFilter = (key: string) =>
        setFilters((prev) => ({ ...prev, [key]: key === "searchTerm" ? "" : "all" }));

    // --- Always render filters, even while loading ---
    return (
        <TableContainer
            title="Casino List"
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
            {/* Filters always visible */}
            <CasinoSearchFilters
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                states={states}
            />

            <CasinoActiveFilters
                filters={filters}
                states={states}
                onClearFilter={clearFilter}
            />

            {/* Table area */}
            <div className="rounded-md border">
                {isLoadingInitial ? (
                    <TableSkeleton
                        rows={pageSize}
                        columns={5}
                        columnWidths={["w-32", "w-24", "w-20", "w-16", "w-12"]}
                    />
                ) : (
                    <Table>
                        <TableCaption className="sr-only">
                            All casinos. Untracked casinos are highlighted in red.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead className="text-right">Tracked</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPageData.map((c: any) => (
                                <TableRow
                                    key={c._id}
                                    className={!c.is_tracked ? "bg-red-50 dark:bg-red-500/15" : undefined}
                                >
                                    <TableCell className="flex flex-col">
                                        <div className="font-medium">{c.name}</div>
                                        <span className="text-[11px] text-muted-foreground">
                                            {c.state?.name ?? "—"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {c.website ? (
                                            <a
                                                href={c.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Visit Site
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No website</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {c.license_status || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        {c.state?.abbreviation || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {c.is_tracked ? (
                                            <span className="text-green-600 font-medium">Yes</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">No</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

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
        </TableContainer>
    );
}
