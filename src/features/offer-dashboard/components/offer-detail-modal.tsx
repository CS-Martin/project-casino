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
import { Separator } from '@/components/ui/separator';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Gift,
    Clock,
    Info,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Award,
} from 'lucide-react';

interface OfferDetailModalProps {
    offer: OfferWithChanges | null;
    casinoName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OfferDetailModal({
    offer,
    casinoName,
    open,
    onOpenChange,
}: OfferDetailModalProps) {
    if (!offer) return null;

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No expiration';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getValueRating = (score: number) => {
        if (score >= 40) return { label: 'Excellent', color: 'text-green-600', icon: '🌟' };
        if (score >= 25) return { label: 'Very Good', color: 'text-blue-600', icon: '⭐' };
        if (score >= 15) return { label: 'Good', color: 'text-purple-600', icon: '✨' };
        if (score >= 10) return { label: 'Fair', color: 'text-yellow-600', icon: '💫' };
        return { label: 'Poor', color: 'text-orange-600', icon: '⚡' };
    };

    const valueRating = getValueRating(offer.valueScore);
    const isRecentlyUpdated = offer.daysSinceUpdate <= 7;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Gift className="h-6 w-6 text-purple-600" />
                                {offer.offer_name}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-2">
                                {casinoName && <span>{casinoName}</span>}
                                {offer.offer_type && (
                                    <>
                                        <span>•</span>
                                        <Badge variant="outline">{offer.offer_type}</Badge>
                                    </>
                                )}
                                {isRecentlyUpdated && (
                                    <>
                                        <span>•</span>
                                        <Badge className="bg-green-500">Recently Updated</Badge>
                                    </>
                                )}
                            </DialogDescription>
                        </div>
                        {offer.isActive ? (
                            <Badge className="bg-green-500 shrink-0">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                            </Badge>
                        ) : offer.isExpired ? (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                Expired
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="shrink-0">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Removed
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {/* Value Score Highlight */}
                {offer.valueScore > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800 my-4 md:my-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    Value Score
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Based on bonus amount vs wagering requirement
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                    <span>{valueRating.icon}</span>
                                    <span className={valueRating.color}>{offer.valueScore}</span>
                                </div>
                                <div className={`text-sm font-medium ${valueRating.color}`}>
                                    {valueRating.label}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 my-4 md:my-6">
                    {offer.expected_bonus !== undefined && (
                        <div className="text-center p-3 md:p-6 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500 dark:border-green-700">
                            <DollarSign className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 md:mb-3 text-green-600" />
                            <div className="text-xl md:text-3xl font-bold text-green-600">
                                ${offer.expected_bonus}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Bonus Amount</div>
                        </div>
                    )}

                    {offer.expected_deposit !== undefined && (
                        <div className="text-center p-3 md:p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-500 dark:border-blue-700">
                            <DollarSign className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 md:mb-3 text-blue-600" />
                            <div className="text-xl md:text-3xl font-bold text-blue-600">
                                ${offer.expected_deposit}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Required Deposit</div>
                        </div>
                    )}

                    {offer.wagering_requirement !== undefined && (
                        <div className="text-center p-3 md:p-6 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-500 dark:border-purple-700">
                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 md:mb-3 text-purple-600" />
                            <div className="text-xl md:text-3xl font-bold text-purple-600">
                                {offer.wagering_requirement}x
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Wagering Req.</div>
                        </div>
                    )}

                    {offer.max_bonus !== undefined && (
                        <div className="text-center p-3 md:p-6 bg-orange-50 dark:bg-orange-950 rounded-lg border-2 border-orange-500 dark:border-orange-700">
                            <Gift className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 md:mb-3 text-orange-600" />
                            <div className="text-xl md:text-3xl font-bold text-orange-600">
                                ${offer.max_bonus}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Max Bonus</div>
                        </div>
                    )}
                </div>

                <Separator className="my-4 md:my-8" />

                {/* Detailed Information */}
                <div className="space-y-4 md:space-y-6">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Offer Details
                    </h3>

                    {offer.description && (
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                            <p className="text-base leading-relaxed">{offer.description}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Validity Period
                            </h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Valid Until:</span>
                                    <span className="font-medium">{formatDate(offer.valid_until)}</span>
                                </div>
                                {offer.valid_until && !offer.isExpired && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Days Remaining:</span>
                                        <span className="font-medium text-green-600">
                                            {Math.ceil(
                                                (new Date(offer.valid_until).getTime() - Date.now()) /
                                                (1000 * 60 * 60 * 24)
                                            )}{' '}
                                            days
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Update History
                            </h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span className="font-medium">
                                        {getTimeAgo(offer._creationTime)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="font-medium">
                                        {offer.updated_at
                                            ? getTimeAgo(offer.updated_at)
                                            : 'Never updated'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {offer.min_deposit !== undefined && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Minimum Deposit</h4>
                            <p className="text-sm font-medium">${offer.min_deposit}</p>
                        </div>
                    )}

                    {offer.terms && (
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 md:mb-3">Terms & Conditions</h4>
                            <div className="bg-muted/50 rounded-lg p-3 md:p-5 text-sm max-h-48 md:max-h-64 overflow-y-auto border">
                                <p className="whitespace-pre-wrap">{offer.terms}</p>
                            </div>
                        </div>
                    )}

                    {offer.source && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{offer.source}</Badge>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={offer.source} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Change Indicator */}
                {isRecentlyUpdated && (
                    <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 dark:border-green-700 rounded-lg p-4 md:p-5 mt-4 md:mt-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">
                                    Recently Updated
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    This offer was updated {offer.daysSinceUpdate} day
                                    {offer.daysSinceUpdate !== 1 ? 's' : ''} ago. The information shown is
                                    current.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

