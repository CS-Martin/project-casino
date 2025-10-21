import OfferKpis from "@/features/offer-dashboard/components/offer-kpis";
import OfferTimelineChart from "@/features/offer-dashboard/components/offer-timeline-chart";
import OfferTypeBreakdownChart from "@/features/offer-dashboard/components/offer-type-breakdown-chart";

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

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-5">
                    {/* Timeline Chart */}
                    <div className="md:col-span-3">
                        <OfferTimelineChart />
                    </div>

                    {/* Offer Type Breakdown */}
                    <div className="md:col-span-2">
                        <OfferTypeBreakdownChart />
                    </div>
                </div>
            </div>
        </div>
    );
}