import { X } from "lucide-react";

interface CasinoResearchActiveFiltersProps {
    filters: {
        searchTerm: string;
        statusFilter: string;
    };
    onClearFilter: (key: string) => void;
}

export function CasinoResearchActiveFilters({
    filters,
    onClearFilter
}: CasinoResearchActiveFiltersProps) {
    const hasActiveFilters = filters.searchTerm || filters.statusFilter !== "all";

    if (!hasActiveFilters) return null;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'current': return 'Current';
            case 'stale': return 'Stale';
            case 'missing': return 'Missing';
            default: return status;
        }
    };

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
            {filters.statusFilter !== "all" && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md text-sm">
                    <span className="text-purple-700 dark:text-purple-300">
                        Status: {getStatusLabel(filters.statusFilter)}
                    </span>
                    <button
                        onClick={() => onClearFilter('statusFilter')}
                        className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
        </div>
    );
}

