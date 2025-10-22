"use client";

import OfferKpis from "@/features/offer-dashboard/components/offer-kpis";
import OfferTimelineChart from "@/features/offer-dashboard/components/offer-timeline-chart";
import OfferTypeBreakdownChart from "@/features/offer-dashboard/components/offer-type-breakdown-chart";
import CasinoResearchStatusTable from "@/features/offer-dashboard/components/casino-research-status-table";
import { ResearchHistoryTable } from "@/features/offer-dashboard/components/research-history-table";

export default function OfferDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Offer Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor offer performance, trends, and casino activity
                </p>
            </div>

            <div className="space-y-6">
                {/* KPI Cards */}
                <div>
                    <OfferKpis />
                </div>



                {/* Offer Timeline Chart */}
                <div>
                    <OfferTimelineChart />
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 grid-cols-1 2xl:grid-cols-5">
                    {/* Timeline Chart */}
                    <div className="col-span-1 2xl:col-span-3">
                        <ResearchHistoryTable />
                    </div>

                    {/* Offer Type Breakdown */}
                    <div className="col-span-1 2xl:col-span-2">
                        <OfferTypeBreakdownChart />
                    </div>
                </div>

                {/* Casino Research Status Table */}
                <div>
                    <CasinoResearchStatusTable />
                </div>
            </div>
        </div>
    );
}