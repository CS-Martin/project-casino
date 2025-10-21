"use client";

import { Building2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import KPICard from "@/features/casino-dashboard/components/kpi-card";
import StateChart from "@/features/casino-dashboard/components/state-chart";
import { PieDonutActive } from "@/features/casino-dashboard/components/pie-donut-active";
import { KPICardsSkeleton } from "@/features/casino-dashboard/components/skeletons";
import { useDashboardStats } from "@/features/casino-dashboard/hooks/use-dashboard-stats";
import { SearchCasinosBtn } from "@/features/casino-dashboard/components/search-casinos-btn";
import { CasinoListTable } from "@/features/casino-dashboard/components/casino-list-table";

export default function DashboardPage() {
    const { casinoStats, isLoading } = useDashboardStats();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold tracking-tight">Casino Dashboard</h1>
                    <p className="text-muted-foreground">
                        Comprehensive overview of casino tracking metrics and market analysis
                    </p>
                </div>
                <div>
                    <SearchCasinosBtn />
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
                    <PieDonutActive />
                </div>

                <div className="w-full 2xl:w-[40%]">
                    <StateChart />
                </div>
            </div>

            {/* Casino List */}
            <div>
                <CasinoListTable />
            </div>
        </div>
    );
}
