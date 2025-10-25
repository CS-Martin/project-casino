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
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
            {/* Top Row: Search Bar */}
            <div className="w-full 2xl:w-1/3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search casinos by name, website, license, or state..."
                        value={filters.searchTerm}
                        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>

            {/* Bottom Row: Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full 2xl:w-auto">
                {/* Filter Label and Controls */}
                <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                    {/* Filter Label */}
                    <div className="flex items-center gap-2 shrink-0 mr-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium whitespace-nowrap">Filters:</span>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row gap-3 w-full">
                        {/* State Filter */}
                        <Select value={filters.stateId} onValueChange={(value) => onFilterChange('stateId', value)}>
                            <SelectTrigger className="w-full min-w-[140px]">
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
                            <SelectTrigger className="w-full min-w-[140px]">
                                <SelectValue placeholder="All Licenses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Licenses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Tracked Status Filter */}
                        <Select value={filters.trackedStatus} onValueChange={(value) => onFilterChange('trackedStatus', value)}>
                            <SelectTrigger className="w-full min-w-[140px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Tracked</SelectItem>
                                <SelectItem value="false">Untracked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clear Filters Button - Right aligned on larger screens */}
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