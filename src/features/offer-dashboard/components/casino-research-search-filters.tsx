import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasinoResearchSearchFiltersProps {
    filters: {
        searchTerm: string;
        statusFilter: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export function CasinoResearchSearchFilters({
    filters,
    onFilterChange,
    onClearFilters,
}: CasinoResearchSearchFiltersProps) {
    const hasActiveFilters = filters.searchTerm || filters.statusFilter !== "all";

    return (
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="w-full 2xl:w-1/3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by casino name, state, or status..."
                        value={filters.searchTerm}
                        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full 2xl:w-auto">
                <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                    {/* Filter Label */}
                    <div className="flex items-center gap-2 shrink-0 mr-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium whitespace-nowrap">Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <div className="grid grid-cols-1 xs:grid-cols-1 lg:grid-cols-1 xl:flex xl:flex-row gap-3 w-full">
                        <Select value={filters.statusFilter} onValueChange={(value) => onFilterChange('statusFilter', value)}>
                            <SelectTrigger className="w-full min-w-[140px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="recent">Recent</SelectItem>
                                <SelectItem value="old">Old</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="w-full sm:w-auto flex justify-start sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            <X className="h-4 w-4" />
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

