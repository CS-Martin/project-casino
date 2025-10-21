import OfferKpis from "@/features/offer-dashboard/components/offer-kpis";

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
                <div>
                    <OfferKpis />
                </div>
            </div>
        </div>
    );
}