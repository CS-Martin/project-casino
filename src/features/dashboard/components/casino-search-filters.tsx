import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasinoSearchFiltersProps {
    filters: {
        searchTerm: string;
        stateId: string;
        licenseStatus: string;
        trackedStatus: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    states: any[];
}

export function CasinoSearchFilters({
    filters,
    onFilterChange,
    onClearFilters,
    states
}: CasinoSearchFiltersProps) {
    const hasActiveFilters =
        filters.searchTerm ||
        filters.stateId !== "all" ||
        filters.licenseStatus !== "all" ||
        filters.trackedStatus !== "all";

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative lg:w-1/3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search casinos by name, website, license, or state..."
                    value={filters.searchTerm}
                    onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                {/* State Filter */}
                <Select value={filters.stateId} onValueChange={(value) => onFilterChange('stateId', value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((state) => (
                            <SelectItem key={state._id} value={state._id}>
                                {state.name} ({state.abbreviation})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* License Status Filter */}
                <Select value={filters.licenseStatus} onValueChange={(value) => onFilterChange('licenseStatus', value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Licenses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Licenses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Revoked">Revoked</SelectItem>
                    </SelectContent>
                </Select>

                {/* Tracked Status Filter */}
                <Select value={filters.trackedStatus} onValueChange={(value) => onFilterChange('trackedStatus', value)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="true">Tracked</SelectItem>
                        <SelectItem value="false">Untracked</SelectItem>
                    </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}