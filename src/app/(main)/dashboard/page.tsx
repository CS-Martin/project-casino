"use client";

import { Building2, CheckCircle, XCircle, AlertTriangle, SearchCheck } from "lucide-react";
import KPICard from "@/features/dashboard/components/kpi-card";
import StateChart from "@/features/dashboard/components/state-chart";
import { PieDonutActive } from "@/features/dashboard/components/pie-donut-active";
import { transformCasinoData } from "@/features/dashboard/lib/market-coverage-utils";
import { Button } from "@/components/ui/button";
import { KPICardsSkeleton, MarketCoverageSkeleton, StateChartSkeleton, SummarySkeleton } from "@/features/dashboard/components/skeletons";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

export default function DashboardPage() {
    const { casinoStats, casinoStateStats, isLoading } = useDashboardStats();

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
        </div>
    );
}
