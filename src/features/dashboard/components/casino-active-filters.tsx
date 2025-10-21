import { X } from "lucide-react";

interface CasinoActiveFiltersProps {
    filters: {
        searchTerm: string;
        stateId: string;
        licenseStatus: string;
        trackedStatus: string;
    };
    states: any[];
    onClearFilter: (key: string) => void;
}

export function CasinoActiveFilters({
    filters,
    states,
    onClearFilter
}: CasinoActiveFiltersProps) {
    const hasActiveFilters =
        filters.searchTerm ||
        filters.stateId !== "all" ||
        filters.licenseStatus !== "all" ||
        filters.trackedStatus !== "all";

    if (!hasActiveFilters) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {filters.searchTerm && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Search: "{filters.searchTerm}"</span>
                    <button
                        onClick={() => onClearFilter('searchTerm')}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
            {filters.stateId !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md text-sm">
                    <span className="text-green-700 dark:text-green-300">
                        State: {states.find((s) => s._id === filters.stateId)?.name}
                    </span>
                    <button
                        onClick={() => onClearFilter('stateId')}
                        className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
            {filters.licenseStatus !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md text-sm">
                    <span className="text-purple-700 dark:text-purple-300">
                        License: {filters.licenseStatus}
                    </span>
                    <button
                        onClick={() => onClearFilter('licenseStatus')}
                        className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
            {filters.trackedStatus !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md text-sm">
                    <span className="text-orange-700 dark:text-orange-300">
                        Status: {filters.trackedStatus === "true" ? "Tracked" : "Untracked"}
                    </span>
                    <button
                        onClick={() => onClearFilter('trackedStatus')}
                        className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
        </div>
    );
}