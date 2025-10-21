'use client';

import { useOfferKpis } from '../hooks/use-offer-kpis';
import OfferKpiCard from './offer-kpi-card';
import {
    Gift,
    Clock,
    Building2,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

export default function OfferKpis() {
    const { kpis, isLoading } = useOfferKpis();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 5 }).map((_, i) => (
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

    // Calculate percentages for context
    const activeOffersPercentage = kpis.totalOffers > 0 ? (kpis.totalActiveOffers / kpis.totalOffers) * 100 : 0;
    const expiredOffersPercentage = kpis.totalOffers > 0 ? (kpis.totalExpiredOffers / kpis.totalOffers) * 100 : 0;
    const casinosUpdatedPercentage = kpis.totalCasinosWithOffers > 0 ? (kpis.totalCasinosWithUpdatedOffers / kpis.totalCasinosWithOffers) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Total Active Offers */}
            <OfferKpiCard
                title="Active Offers"
                value={kpis.totalActiveOffers}
                isLoading={isLoading}
                variant="default"
                icon={CheckCircle}
                tooltip="Latest offers per casino with recent checks and not expired"
                subtitle={`${Math.round(activeOffersPercentage)}% of total offers`}
            />

            {/* Total New Offers */}
            <OfferKpiCard
                title="Total Offers"
                value={kpis.totalNewOffers}
                isLoading={isLoading}
                variant="default"
                icon={Gift}
                tooltip="Total number of offers in the system"
                subtitle={`${kpis.totalCasinosWithOffers} casinos`}
            />

            {/* Total Expired Offers */}
            <OfferKpiCard
                title="Expired Offers"
                value={kpis.totalExpiredOffers}
                isLoading={isLoading}
                variant="default"
                icon={AlertTriangle}
                tooltip="Total offers that have expired or been deprecated"
                subtitle={`${Math.round(expiredOffersPercentage)}% of total offers`}
            />

            {/* Average Offer Lifetime */}
            <OfferKpiCard
                title="Avg Lifetime"
                value={`${kpis.averageOfferLifetime} days`}
                isLoading={isLoading}
                variant="default"
                icon={Clock}
                tooltip="Average duration from offer creation to expiration or current date for active offers"
                subtitle={`${kpis.totalOffers} total offers`}
            />

            {/* Casinos with Updated Offers */}
            <OfferKpiCard
                title="Casinos Updated"
                value={kpis.totalCasinosWithUpdatedOffers}
                isLoading={isLoading}
                variant="default"
                icon={Building2}
                tooltip="Number of casinos that have had offers updated"
                subtitle={`${Math.round(casinosUpdatedPercentage)}% of casinos`}
            />
        </div>
    );
}