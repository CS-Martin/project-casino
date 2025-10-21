'use client';

import { useOfferKpis } from '../hooks/use-offer-kpis';
import OfferKpiCard from './offer-kpi-card';
import {
    Gift,
    Clock,
    Building2,
    AlertTriangle,
    CheckCircle,
    Star,
    BarChart3,
} from 'lucide-react';

export default function OfferKpis() {
    const { kpis, isLoading } = useOfferKpis();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (!kpis) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Failed to load offer KPIs
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Offers (All Time) */}
            <OfferKpiCard
                title="Total Offers (All Time)"
                value={kpis.totalOffers}
                isLoading={isLoading}
                variant="default"
                icon={BarChart3}
                tooltip="Total number of offers ever created in the system"
                subtitle="All time"
            />

            {/* Casinos with Offers */}
            <OfferKpiCard
                title="Casinos with Offers"
                value={`${kpis.casinosWithOffers}/${kpis.totalCasinos}`}
                isLoading={isLoading}
                variant="default"
                icon={Building2}
                tooltip="Number of casinos that have offers"
                subtitle={`${kpis.casinosWithOffersPercentage}% of total casinos`}
            />

            {/* Active Offers (Current) */}
            <OfferKpiCard
                title="Active Offers (Current)"
                value={kpis.activeOffers}
                isLoading={isLoading}
                variant="default"
                icon={CheckCircle}
                tooltip="Offers that are currently active and not expired"
                subtitle="Currently valid"
            />

            {/* Offers Researched Today */}
            <OfferKpiCard
                title="Offers Researched Today"
                value={kpis.offersResearchedToday}
                isLoading={isLoading}
                variant="default"
                icon={Clock}
                tooltip="Number of offers researched and added today"
                subtitle="Today"
            />
        </div>
    );
}