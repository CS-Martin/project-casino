"use client";

import { Building2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import KPICard from "@/features/casino-dashboard/components/kpi-card";
import StateChart from "@/features/casino-dashboard/components/state-chart";
import { PieDonutActive } from "@/features/casino-dashboard/components/pie-donut-active";
import { KPICardsSkeleton } from "@/features/casino-dashboard/components/skeletons";
import { useDashboardStats } from "@/features/casino-dashboard/hooks/use-dashboard-stats";
import { SearchCasinosBtn } from "@/features/casino-dashboard/components/search-casinos-btn";
import { CasinoListTable } from "@/features/casino-dashboard/components/casino-list-table";
import { DiscoveryHistoryTable } from "@/features/casino-dashboard/components/discovery-history-table";

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
                        tooltip="Total number of casinos discovered and stored in the database across all states"
                        subtitle="All casinos"
                    />
                    <KPICard
                        title="Tracked Casinos"
                        value={casinoStats?.tracked || 0}
                        isLoading={false}
                        variant="positive"
                        icon={CheckCircle}
                        tooltip="Casinos actively monitored for promotional offers and updates. These casinos are being researched regularly."
                        subtitle={`${Math.round(((casinoStats?.tracked || 0) / (casinoStats?.total || 1)) * 100)}% of total`}
                    />
                    <KPICard
                        title="Untracked Casinos"
                        value={casinoStats?.untracked || 0}
                        isLoading={false}
                        variant="negative"
                        icon={XCircle}
                        tooltip="Casinos in the database that are not currently being monitored. These may need review or activation."
                        subtitle={`${Math.round(((casinoStats?.untracked || 0) / (casinoStats?.total || 1)) * 100)}% of total`}
                    />
                    <KPICard
                        title="Coverage Gap"
                        value={`${casinoStats?.coverageGapPercentage || 0}%`}
                        isLoading={false}
                        variant="negative"
                        icon={AlertTriangle}
                        tooltip="Percentage of casinos not being tracked. A lower gap indicates better market coverage and monitoring."
                        subtitle="Opportunity to improve"
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

            {/* Discovery History */}
            <div>
                <DiscoveryHistoryTable />
            </div>

            {/* Casino List */}
            <div>
                <CasinoListTable />
            </div>
        </div>
    );
}
