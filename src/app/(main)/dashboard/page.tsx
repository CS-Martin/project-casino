"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import KPICard from "@/features/dashboard/components/kpi-card";
import StateChart from "@/features/dashboard/components/state-chart";


// Main Analytics Page
export default function DashboardPage() {
    const casinoStats = useQuery(api.casinos.index.getCasinoStats);
    const isLoading = casinoStats === undefined;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Comprehensive overview of casino tracking metrics and market analysis
                </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Casinos"
                    value={casinoStats?.total || 0}
                    isLoading={isLoading}
                    variant="default"

                    icon={Building2}
                />
                <KPICard
                    title="Tracked Casinos"
                    value={casinoStats?.tracked || 0}
                    isLoading={isLoading}
                    variant="positive"
                    icon={CheckCircle}
                />
                <KPICard
                    title="Untracked Casinos"
                    value={casinoStats?.untracked || 0}
                    isLoading={isLoading}
                    variant="negative"
                    icon={XCircle}
                />
                <KPICard
                    title="Coverage Gap"
                    value={`${casinoStats?.coverageGapPercentage || 0}%`}
                    isLoading={isLoading}
                    variant="negative"
                    icon={AlertTriangle}
                />
            </div>

            {/* State Chart */}
            <StateChart />

            {/* Summary Section */}
            {!isLoading && casinoStats && (
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
            )}
        </div>
    );
}
