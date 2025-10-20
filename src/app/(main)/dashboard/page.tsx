"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle, AlertTriangle, SearchCheck } from "lucide-react";
import KPICard from "@/features/dashboard/components/kpi-card";
import StateChart from "@/features/dashboard/components/state-chart";
import { PieDonutActive } from "@/features/dashboard/components/pie-donut-active";
import { transformCasinoData } from "@/features/dashboard/lib/market-coverage-utils";
import { Button } from "@/components/ui/button";
import { KPICardsSkeleton, MarketCoverageSkeleton, StateChartSkeleton, SummarySkeleton } from "@/features/dashboard/components/skeletons";

export default function DashboardPage() {
    const casinoStats = useQuery(api.casinos.index.getCasinoStats);
    const casinoStateStats = useQuery(api.casinos.index.getCasinosByStateStats);
    const isLoading = casinoStats === undefined || casinoStateStats === undefined;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Comprehensive overview of casino tracking metrics and market analysis
                    </p>
                </div>
                <div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <SearchCheck className="size-4" />
                        Manually Discover Casinos
                    </Button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            {isLoading ? (
                <KPICardsSkeleton />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard
                        title="Total Casinos"
                        value={casinoStats?.total || 0}
                        isLoading={false}
                        variant="default"
                        icon={Building2}
                    />
                    <KPICard
                        title="Tracked Casinos"
                        value={casinoStats?.tracked || 0}
                        isLoading={false}
                        variant="positive"
                        icon={CheckCircle}
                    />
                    <KPICard
                        title="Untracked Casinos"
                        value={casinoStats?.untracked || 0}
                        isLoading={false}
                        variant="negative"
                        icon={XCircle}
                    />
                    <KPICard
                        title="Coverage Gap"
                        value={`${casinoStats?.coverageGapPercentage || 0}%`}
                        isLoading={false}
                        variant="negative"
                        icon={AlertTriangle}
                    />
                </div>
            )}

            <div className="flex flex-col 2xl:flex-row gap-4">
                <div className="w-full 2xl:w-[60%]">
                    {/* Market Coverage Analytics */}
                    {isLoading ? (
                        <MarketCoverageSkeleton />
                    ) : casinoStateStats ? (
                        <PieDonutActive data={transformCasinoData(casinoStateStats)} />
                    ) : null}
                </div>

                <div className="w-full 2xl:w-[40%]">
                    {/* State Chart */}
                    {isLoading ? (
                        <StateChartSkeleton />
                    ) : (
                        <StateChart />
                    )}
                </div>
            </div>

            {/* Summary Section */}
            {isLoading ? (
                <SummarySkeleton />
            ) : casinoStats ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-2">Coverage Analysis</h3>
                                <p className="text-sm text-muted-foreground">
                                    Currently tracking {casinoStats.tracked} out of {casinoStats.total} casinos,
                                    representing a {100 - casinoStats.coverageGapPercentage}% coverage rate.
                                    There are {casinoStats.untracked} casinos that require attention.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Next Steps</h3>
                                <p className="text-sm text-muted-foreground">
                                    Focus on expanding coverage in states with high untracked casino counts.
                                    Consider prioritizing states with the largest coverage gaps for maximum impact.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
