import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CasinoSearchFilters } from "./casino-search-filters";
import { CasinoActiveFilters } from "./casino-active-filters";
import { TableContainer } from "@/components/custom/table/table-container";
import { TableSkeleton } from "@/components/custom/table/table-skeleton";
import { CustomPagination } from "@/components/custom/table/custom-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { useStates } from "../hooks/use-states";
import { useCasinoList } from "../hooks/use-casino-list";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CasinoListTable() {
    const [pageSize, setPageSize] = useState(10);
    const { states } = useStates();
    const toggleTrackCasino = useMutation(api.casinos.index.toggleTrackCasino);

    // --- Filters stay stable across data fetches ---
    const [filters, setFilters] = useState({
        searchTerm: "",
        stateId: "all",
        licenseStatus: "all",
        trackedStatus: "all"
    });

    // --- Track/Untrack state ---
    const [confirmationDialog, setConfirmationDialog] = useState<{
        open: boolean;
        casinoId: Id<'casinos'> | null;
        casinoName: string;
        isTracked: boolean;
        isLoading: boolean;
    }>({
        open: false,
        casinoId: null,
        casinoName: '',
        isTracked: false,
        isLoading: false,
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
    // Use pageSize as part of a key to force re-fetch when page size changes
    const { casinos, isLoadingInitial, hasMore, loadMore } = useCasinoList(pageSize, apiFilters);
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
        data: casinos,
        pageSize,
        hasMore,
        onLoadMore: loadMore
    });

    // --- Filter handlers ---
    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        resetPagination(); // Reset to page 1 when any filter changes
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: "",
            stateId: "all",
            licenseStatus: "all",
            trackedStatus: "all"
        });
        resetPagination(); // Reset to page 1 when clearing filters
    };

    const clearFilter = (key: string) => {
        setFilters((prev) => ({ ...prev, [key]: key === "searchTerm" ? "" : "all" }));
        resetPagination(); // Reset to page 1 when clearing individual filters
    };

    // --- Page size handler ---
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        resetPagination(); // Reset to page 1 when changing page size
    };

    // --- Track/Untrack handlers ---
    const handleTrackToggle = (casinoId: Id<'casinos'>, casinoName: string, isTracked: boolean) => {
        setConfirmationDialog({
            open: true,
            casinoId,
            casinoName,
            isTracked,
            isLoading: false,
        });
    };

    const handleConfirmTrackToggle = async () => {
        if (!confirmationDialog.casinoId) return;

        setConfirmationDialog(prev => ({ ...prev, isLoading: true }));

        try {
            await toggleTrackCasino({
                casinoId: confirmationDialog.casinoId,
                isTracked: !confirmationDialog.isTracked,
            });

            toast.success(
                `${confirmationDialog.casinoName} is now ${!confirmationDialog.isTracked ? 'tracked' : 'untracked'}`
            );

            setConfirmationDialog({
                open: false,
                casinoId: null,
                casinoName: '',
                isTracked: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error toggling track status:', error);
            toast.error('Failed to update track status. Please try again.');
            setConfirmationDialog(prev => ({ ...prev, isLoading: false }));
        }
    };

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
                                <TableHead>Source URL</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead className="text-center">Tracked</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPageData.map((c: any) => (
                                <TableRow
                                    key={c._id}
                                    className={!c.is_tracked ? "bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/20" : undefined}
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
                                        {c.source_url ? (
                                            <a
                                                href={c.source_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Visit Source
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">No source URL</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {c.license_status || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>
                                        {c.state?.abbreviation || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {c.is_tracked ? (
                                            <span className="text-green-600 font-medium">Yes</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">No</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant={c.is_tracked ? "destructive" : "default"}
                                            size="sm"
                                            onClick={() => handleTrackToggle(c._id, c.name, c.is_tracked)}
                                            className={cn("h-8 px-3", c.is_tracked ? "bg-red-400 text-white hover:bg-red-500" : "bg-purple-500 text-white hover:bg-purple-600")}
                                        >
                                            {c.is_tracked ? (
                                                <>
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Untrack
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Track
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center justify-between py-4">
                <PageSizeSelector
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                />
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

            <ConfirmationDialog
                open={confirmationDialog.open}
                onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
                title={confirmationDialog.isTracked ? "Untrack Casino" : "Track Casino"}
                description={
                    confirmationDialog.isTracked
                        ? `Are you sure you want to stop tracking "${confirmationDialog.casinoName}"? This will remove it from your tracked casinos list.`
                        : `Are you sure you want to start tracking "${confirmationDialog.casinoName}"? This will add it to your tracked casinos list.`
                }
                confirmText={confirmationDialog.isTracked ? "Untrack" : "Track"}
                cancelText="Cancel"
                onConfirm={handleConfirmTrackToggle}
                isLoading={confirmationDialog.isLoading}
                variant={confirmationDialog.isTracked ? "destructive" : "default"}
            />
        </TableContainer>
    );
}
