import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles } from "lucide-react";

export function KPICardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16" />
            </CardContent>
        </Card>
    );
}

export function KPICardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <KPICardSkeleton key={i} />
            ))}
        </div>
    );
}

export function MarketCoverageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="textfont-semibold">Market Coverage Overview</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Track casino coverage gaps and expansion opportunities by state
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 lg:grid-cols-2">
                    {/* Chart Section */}
                    <div className="space-y-4">
                        <div className="h-full lg:h-[400px] w-full">
                            <Skeleton className="h-full w-full rounded-lg" />
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <div className="border-b p-2">
                                        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
                                            <div>State</div>
                                            <div className="text-center">Coverage</div>
                                            <div className="text-center">Gap</div>
                                            <div className="text-center">Opportunity</div>
                                            <div className="text-center">Total</div>
                                        </div>
                                    </div>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="border-b p-2">
                                            <div className="grid grid-cols-5 gap-2 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-2 h-2 rounded-full" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-3 w-12 mx-auto" />
                                                <Skeleton className="h-3 w-12 mx-auto" />
                                                <Skeleton className="h-5 w-16 mx-auto" />
                                                <Skeleton className="h-3 w-8 mx-auto" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Critical States</div>
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Avg Coverage</div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function StateChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>State-by-State Market Analysis</CardTitle>
                <CardDescription>Showing tracked and untracked casinos for each state.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] ">
                    <Skeleton className="h-full w-full rounded-lg" />
                </div>
            </CardContent>
        </Card>
    );
}

export function SummarySkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-1" />
                    </div>
                    <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-7 w-24 mb-1" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            {/* KPI Cards */}
            <KPICardsSkeleton />

            {/* Market Coverage */}
            <MarketCoverageSkeleton />

            {/* State Chart */}
            <StateChartSkeleton />

            {/* Summary */}
            <SummarySkeleton />
        </div>
    );
}

export function CasinoListTableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Casino List</CardTitle>
                <CardDescription>Loading casinos...</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
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
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

interface BestOfferSkeletonProps {
    showAnalyzingText?: boolean;
}

export function BestOfferSkeleton({ showAnalyzingText = true }: BestOfferSkeletonProps) {
    return (
        <div className="bg-linear-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-purple-950/50 rounded-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600 animate-spin" />
                {showAnalyzingText && (
                    <h4 className="font-bold text-lg">AI is analyzing offers...</h4>
                )}
                {!showAnalyzingText && (
                    <Skeleton className="h-7 w-48" />
                )}
            </div>

            <div className="space-y-4">
                {/* Best Offer Card Skeleton */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-20 ml-auto" />
                            <Skeleton className="h-3 w-24 ml-auto" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-full" />
                </div>

                {/* Reasoning Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>

                {/* Strengths Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-28 mb-2" />
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>

                {/* Considerations Section Skeleton */}
                <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </div>

                {/* Ranking Factors Skeleton */}
                <div>
                    <Skeleton className="h-5 w-56 mb-3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2 p-3 rounded-lg bg-white/30 dark:bg-gray-900/30">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-10" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t">
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>
        </div>
    );
}