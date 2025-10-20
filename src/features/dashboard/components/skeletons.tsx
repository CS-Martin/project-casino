import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
