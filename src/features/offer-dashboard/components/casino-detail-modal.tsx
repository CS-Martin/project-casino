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
import {
    ExternalLink,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    Gift,
    AlertTriangle,
    XCircle,
    Eye,
    GitCompare,
} from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import OfferDetailModal from './offer-detail-modal';
import OfferComparisonModal from './offer-comparison-modal';

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
    const [comparisonMode, setComparisonMode] = React.useState(false);

    const handleOfferClick = (offer: OfferWithChanges) => {
        if (comparisonMode) {
            if (!selectedOfferLeft) {
                setSelectedOfferLeft(offer);
            } else if (!selectedOfferRight) {
                setSelectedOfferRight(offer);
                setComparisonModalOpen(true);
                setComparisonMode(false);
            }
        } else {
            setSelectedOffer(offer);
            setOfferModalOpen(true);
        }
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

    const toggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        setSelectedOfferLeft(null);
        setSelectedOfferRight(null);
    };

    const getTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderOfferCard = (offer: OfferWithChanges) => {
        const isSelectedForComparison =
            comparisonMode &&
            (selectedOfferLeft?._id === offer._id || selectedOfferRight?._id === offer._id);

        return (
            <div
                key={offer._id}
                className={`p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group ${isSelectedForComparison ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' : ''
                    }`}
                onClick={() => handleOfferClick(offer)}
            >
                <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {isSelectedForComparison && (
                                <Badge className="bg-purple-500 text-xs">
                                    {selectedOfferLeft?._id === offer._id ? 'Left' : 'Right'}
                                </Badge>
                            )}
                            <h4 className="font-semibold text-sm md:text-base group-hover:text-purple-400 transition-colors">
                                {offer.offer_name}
                            </h4>
                            {offer.offer_type && (
                                <Badge variant="outline" className="text-xs">
                                    {offer.offer_type}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                            {offer.expected_bonus !== undefined && (
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-green-600" />
                                    <span className="text-muted-foreground">Bonus:</span>
                                    <span className="font-medium">${offer.expected_bonus}</span>
                                </div>
                            )}

                            {offer.expected_deposit !== undefined && (
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-blue-600" />
                                    <span className="text-muted-foreground">Deposit:</span>
                                    <span className="font-medium">${offer.expected_deposit}</span>
                                </div>
                            )}

                            {offer.wagering_requirement !== undefined && (
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-purple-600" />
                                    <span className="text-muted-foreground">Wagering:</span>
                                    <span className="font-medium">{offer.wagering_requirement}x</span>
                                </div>
                            )}

                            {offer.valueScore > 0 && (
                                <div className="flex items-center gap-1">
                                    <Gift className="h-3 w-3 text-yellow-600" />
                                    <span className="text-muted-foreground">Value:</span>
                                    <span className="font-medium">{offer.valueScore}</span>
                                </div>
                            )}
                        </div>

                        {offer.description && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {offer.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-muted-foreground">
                            {offer.valid_until && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Expires: {formatDate(offer.valid_until)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Updated {getTimeAgo(offer.updated_at || offer._creationTime)}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOfferClick(offer);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
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

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-3 md:py-4">
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-green-600">{stats.activeCount}</div>
                        <div className="text-xs text-muted-foreground">Active Offers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold">${stats.avgBonusAmount}</div>
                        <div className="text-xs text-muted-foreground">Avg Bonus</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold">{stats.avgWageringRequirement}x</div>
                        <div className="text-xs text-muted-foreground">Avg Wagering</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold">
                            {stats.daysSinceLastCheck !== null ? `${stats.daysSinceLastCheck}d` : 'Never'}
                        </div>
                        <div className="text-xs text-muted-foreground">Last Check</div>
                    </div>
                </div>

                <Separator />

                {/* Active Offers */}
                {activeOffers.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <Gift className="h-5 w-5 text-green-600" />
                                Active Offers ({activeOffers.length})
                            </h3>
                            <Button
                                variant={comparisonMode ? "default" : "outline"}
                                size="sm"
                                onClick={toggleComparisonMode}
                                className="flex items-center gap-2 w-full sm:w-auto"
                            >
                                <GitCompare className="h-4 w-4" />
                                <span className="hidden sm:inline">{comparisonMode ? 'Cancel Compare' : 'Compare Offers'}</span>
                                <span className="sm:hidden">{comparisonMode ? 'Cancel' : 'Compare'}</span>
                            </Button>
                        </div>
                        {comparisonMode && (
                            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-2 md:p-3 text-xs md:text-sm">
                                <p className="font-medium text-purple-900 dark:text-purple-100">
                                    {!selectedOfferLeft
                                        ? 'Tap the first offer to compare'
                                        : !selectedOfferRight
                                            ? 'Now tap a second offer to compare'
                                            : 'Opening comparison...'}
                                </p>
                            </div>
                        )}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {activeOffers.map(renderOfferCard)}
                        </div>
                    </div>
                )}

                {activeOffers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No active offers found for this casino</p>
                    </div>
                )}

                {/* Expired/Deprecated Offers - Collapsible */}
                {(expiredOffers.length > 0 || deprecatedOffers.length > 0) && (
                    <>
                        <Separator />
                        <details className="space-y-3">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Historical Offers ({expiredOffers.length + deprecatedOffers.length})
                            </summary>
                            <div className="space-y-4 mt-3">
                                {expiredOffers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            Expired ({expiredOffers.length})
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {expiredOffers.slice(0, 5).map(renderOfferCard)}
                                        </div>
                                    </div>
                                )}

                                {deprecatedOffers.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            Removed ({deprecatedOffers.length})
                                        </h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {deprecatedOffers.slice(0, 5).map(renderOfferCard)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </details>
                    </>
                )}
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

