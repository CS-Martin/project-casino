'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useCasinoDetail } from '../hooks/use-casino-detail';
import { Id } from '@convex/_generated/dataModel';
import { ExternalLink } from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import OfferDetailModal from './offer-detail-modal';
import OfferComparisonModal from './offer-comparison-modal';
import { CasinoStats } from './casino-stats';
import { ActiveOffersSection } from './active-offers-section';
import { HistoricalOffersSection } from './historical-offers-section';

interface CasinoDetailModalProps {
    casinoId: Id<'casinos'> | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CasinoDetailModal({
    casinoId,
    open,
    onOpenChange,
}: CasinoDetailModalProps) {
    const { casinoDetail, isLoading } = useCasinoDetail(casinoId);
    const [selectedOffer, setSelectedOffer] = React.useState<OfferWithChanges | null>(null);
    const [offerModalOpen, setOfferModalOpen] = React.useState(false);
    const [selectedOfferLeft, setSelectedOfferLeft] = React.useState<OfferWithChanges | null>(null);
    const [selectedOfferRight, setSelectedOfferRight] = React.useState<OfferWithChanges | null>(null);
    const [comparisonModalOpen, setComparisonModalOpen] = React.useState(false);

    const handleOfferClick = (offer: OfferWithChanges) => {
        setSelectedOffer(offer);
        setOfferModalOpen(true);
    };

    const handleOfferModalClose = () => {
        setOfferModalOpen(false);
        setTimeout(() => setSelectedOffer(null), 200);
    };

    const handleComparisonModalClose = () => {
        setComparisonModalOpen(false);
        setTimeout(() => {
            setSelectedOfferLeft(null);
            setSelectedOfferRight(null);
        }, 200);
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Loading Casino Details</DialogTitle>
                        <DialogDescription>Please wait...</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!casinoDetail) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Casino Not Found</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">Unable to load casino details.</p>
                </DialogContent>
            </Dialog>
        );
    }

    const { casino, state, activeOffers, expiredOffers, deprecatedOffers, stats } = casinoDetail;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl md:text-2xl">{casino.name}</DialogTitle>
                            <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline">{state.name}</Badge>
                                {casino.license_status && (
                                    <span className="text-xs">• {casino.license_status}</span>
                                )}
                            </DialogDescription>
                        </div>
                        {casino.website && (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={casino.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                >
                                    Visit Site
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <CasinoStats stats={stats} />

                <Separator />

                <ActiveOffersSection
                    activeOffers={activeOffers}
                    casinoId={casino._id as string}
                    casinoName={casino.name}
                    onOfferClick={handleOfferClick}
                />

                <HistoricalOffersSection
                    expiredOffers={expiredOffers}
                    deprecatedOffers={deprecatedOffers}
                    onOfferClick={handleOfferClick}
                />
            </DialogContent>

            {/* Offer Detail Modal */}
            <OfferDetailModal
                offer={selectedOffer}
                casinoName={casino?.name}
                open={offerModalOpen}
                onOpenChange={handleOfferModalClose}
            />

            {/* Offer Comparison Modal */}
            <OfferComparisonModal
                offerLeft={selectedOfferLeft}
                offerRight={selectedOfferRight}
                casinoName={casino?.name}
                open={comparisonModalOpen}
                onOpenChange={handleComparisonModalClose}
            />
        </Dialog>
    );
}
