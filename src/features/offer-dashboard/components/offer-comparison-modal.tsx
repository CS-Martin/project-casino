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
import { Separator } from '@/components/ui/separator';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Gift,
    ArrowRight,
    TrendingDown,
    Minus,
    Award,
} from 'lucide-react';

interface OfferComparisonModalProps {
    offerLeft: OfferWithChanges | null;
    offerRight: OfferWithChanges | null;
    casinoName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function OfferComparisonModal({
    offerLeft,
    offerRight,
    casinoName,
    open,
    onOpenChange,
}: OfferComparisonModalProps) {
    if (!offerLeft || !offerRight) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No expiration';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getChangeIndicator = (oldValue: number | undefined, newValue: number | undefined, higherIsBetter = true) => {
        if (oldValue === undefined || newValue === undefined) return null;
        if (oldValue === newValue) {
            return <Minus className="h-4 w-4 text-gray-400" />;
        }

        const isIncrease = newValue > oldValue;
        const isBetter = higherIsBetter ? isIncrease : !isIncrease;

        return isBetter ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
        );
    };

    const getPercentChange = (oldValue: number | undefined, newValue: number | undefined) => {
        if (oldValue === undefined || newValue === undefined || oldValue === 0) return null;
        const change = ((newValue - oldValue) / oldValue) * 100;
        return change.toFixed(0);
    };

    const ComparisonRow = ({
        label,
        leftValue,
        rightValue,
        icon: Icon,
        format = (v) => v?.toString() || '—',
        higherIsBetter = true,
    }: {
        label: string;
        leftValue: any;
        rightValue: any;
        icon: any;
        format?: (v: any) => string;
        higherIsBetter?: boolean;
    }) => {
        const hasChange = leftValue !== rightValue;
        const percentChange = typeof leftValue === 'number' && typeof rightValue === 'number'
            ? getPercentChange(leftValue, rightValue)
            : null;

        return (
            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-8 items-stretch md:items-center py-3 md:py-4 hover:bg-muted/30 rounded-lg px-3 md:px-4 transition-colors border md:border-0">
                {/* Mobile Label - Show at top on mobile */}
                <div className="md:hidden flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </div>

                {/* Left Value */}
                <div className="text-left md:text-right">
                    <div className="md:hidden text-xs text-muted-foreground mb-1">Previous / Option A</div>
                    <div className={`text-xl md:text-2xl font-bold ${hasChange ? 'text-muted-foreground' : ''}`}>
                        {format(leftValue)}
                    </div>
                </div>

                {/* Label & Change Indicator - Desktop only */}
                <div className="hidden md:flex flex-col items-center min-w-[120px]">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </div>
                    {hasChange && typeof leftValue === 'number' && typeof rightValue === 'number' && (
                        <div className="flex items-center gap-1">
                            {getChangeIndicator(leftValue, rightValue, higherIsBetter)}
                            {percentChange && (
                                <span className={`text-xs font-medium ${parseFloat(percentChange) > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {parseFloat(percentChange) > 0 ? '+' : ''}{percentChange}%
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Value */}
                <div className="text-left">
                    <div className="md:hidden text-xs text-muted-foreground mb-1">Current / Option B</div>
                    <div className={`text-xl md:text-lg font-bold md:font-semibold ${hasChange ? 'text-green-600' : ''}`}>
                        {format(rightValue)}
                    </div>
                </div>

                {/* Change Indicator - Mobile only */}
                {hasChange && typeof leftValue === 'number' && typeof rightValue === 'number' && (
                    <div className="md:hidden flex items-center gap-2 pt-2 border-t">
                        {getChangeIndicator(leftValue, rightValue, higherIsBetter)}
                        {percentChange && (
                            <span className={`text-sm font-medium ${parseFloat(percentChange) > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {parseFloat(percentChange) > 0 ? '+' : ''}{percentChange}%
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Offer Comparison</DialogTitle>
                    <DialogDescription>
                        {casinoName && `Comparing offers from ${casinoName}`}
                    </DialogDescription>
                </DialogHeader>

                {/* Headers */}
                <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-stretch md:items-start mb-4 md:mb-6">
                    {/* Left Offer Header */}
                    <div className="text-left md:text-right space-y-2 md:space-y-3 p-4 md:p-6 bg-muted/50 rounded-lg border">
                        <Badge variant="outline" className="mb-2">Previous / Option A</Badge>
                        <h3 className="font-semibold text-lg">{offerLeft.offer_name}</h3>
                        {offerLeft.offer_type && (
                            <Badge variant="outline">{offerLeft.offer_type}</Badge>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center py-2 md:min-w-[160px] md:pt-8">
                        <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-purple-500 rotate-90 md:rotate-0" />
                    </div>

                    {/* Right Offer Header */}
                    <div className="text-left space-y-2 md:space-y-3 p-4 md:p-6 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500 dark:border-green-700">
                        <Badge className="bg-green-500 mb-2">Current / Option B</Badge>
                        <h3 className="font-semibold text-lg">{offerRight.offer_name}</h3>
                        {offerRight.offer_type && (
                            <Badge variant="outline">{offerRight.offer_type}</Badge>
                        )}
                    </div>
                </div>

                <Separator className="my-4 md:my-8" />

                {/* Comparison Rows */}
                <div className="space-y-2 md:space-y-1">
                    <ComparisonRow
                        label="Bonus Amount"
                        leftValue={offerLeft.expected_bonus}
                        rightValue={offerRight.expected_bonus}
                        icon={DollarSign}
                        format={(v) => v !== undefined ? `$${v}` : '—'}
                        higherIsBetter={true}
                    />

                    <Separator />

                    <ComparisonRow
                        label="Required Deposit"
                        leftValue={offerLeft.expected_deposit}
                        rightValue={offerRight.expected_deposit}
                        icon={DollarSign}
                        format={(v) => v !== undefined ? `$${v}` : '—'}
                        higherIsBetter={false}
                    />

                    <Separator />

                    <ComparisonRow
                        label="Wagering Req."
                        leftValue={offerLeft.wagering_requirement}
                        rightValue={offerRight.wagering_requirement}
                        icon={TrendingUp}
                        format={(v) => v !== undefined ? `${v}x` : '—'}
                        higherIsBetter={false}
                    />

                    <Separator />

                    <ComparisonRow
                        label="Max Bonus"
                        leftValue={offerLeft.max_bonus}
                        rightValue={offerRight.max_bonus}
                        icon={Gift}
                        format={(v) => v !== undefined ? `$${v}` : '—'}
                        higherIsBetter={true}
                    />

                    <Separator />

                    <ComparisonRow
                        label="Min Deposit"
                        leftValue={offerLeft.min_deposit}
                        rightValue={offerRight.min_deposit}
                        icon={DollarSign}
                        format={(v) => v !== undefined ? `$${v}` : '—'}
                        higherIsBetter={false}
                    />

                    <Separator />

                    <ComparisonRow
                        label="Value Score"
                        leftValue={offerLeft.valueScore}
                        rightValue={offerRight.valueScore}
                        icon={Award}
                        format={(v) => v !== undefined ? v.toString() : '—'}
                        higherIsBetter={true}
                    />
                </div>

                <Separator className="my-4 md:my-8" />

                {/* Validity Comparison */}
                <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-stretch md:items-center py-3 md:py-4 px-3 md:px-4 bg-muted/20 rounded-lg">
                    <div className="text-left md:text-right space-y-1 md:space-y-2">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4 md:hidden" />
                            Valid Until - Previous
                        </div>
                        <div className="text-base md:text-lg font-semibold">{formatDate(offerLeft.valid_until)}</div>
                    </div>

                    <div className="hidden md:flex items-center justify-center min-w-[160px]">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="text-left space-y-1 md:space-y-2">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4 md:hidden" />
                            Valid Until - Current
                        </div>
                        <div className="text-base md:text-lg font-semibold">{formatDate(offerRight.valid_until)}</div>
                    </div>
                </div>

                <Separator className="my-4 md:my-8" />

                {/* Description Comparison */}
                <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-stretch md:items-start">
                    <div className="text-left md:text-right">
                        <div className="text-sm font-semibold text-muted-foreground mb-2 md:mb-3">
                            Description - Previous
                        </div>
                        <div className="text-sm bg-muted/50 p-3 md:p-4 rounded-lg border min-h-[60px] md:min-h-[80px]">
                            {offerLeft.description || 'No description'}
                        </div>
                    </div>

                    <div className="hidden md:flex items-start justify-center min-w-[160px] pt-10">
                        <ArrowRight className="h-5 w-5 text-purple-500" />
                    </div>

                    <div className="text-left">
                        <div className="text-sm font-semibold text-muted-foreground mb-2 md:mb-3">
                            Description - Current
                        </div>
                        <div className="text-sm bg-green-50 dark:bg-green-950 p-3 md:p-4 rounded-lg border-2 border-green-500 dark:border-green-700 min-h-[60px] md:min-h-[80px]">
                            {offerRight.description || 'No description'}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-500 dark:border-blue-700 rounded-lg p-4 md:p-6 mt-4 md:mt-8">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        Comparison Summary
                    </h4>
                    <div className="text-sm space-y-2">
                        {offerRight.expected_bonus && offerLeft.expected_bonus &&
                            offerRight.expected_bonus > offerLeft.expected_bonus && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Bonus increased by ${offerRight.expected_bonus - offerLeft.expected_bonus}</span>
                                </div>
                            )}
                        {offerRight.wagering_requirement && offerLeft.wagering_requirement &&
                            offerRight.wagering_requirement < offerLeft.wagering_requirement && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Wagering improved by {offerLeft.wagering_requirement - offerRight.wagering_requirement}x</span>
                                </div>
                            )}
                        {offerRight.valueScore > offerLeft.valueScore && (
                            <div className="flex items-center gap-2 text-green-600">
                                <Award className="h-4 w-4" />
                                <span>Overall value improved from {offerLeft.valueScore} to {offerRight.valueScore}</span>
                            </div>
                        )}
                        {offerRight.valueScore < offerLeft.valueScore && (
                            <div className="flex items-center gap-2 text-orange-600">
                                <TrendingDown className="h-4 w-4" />
                                <span>Overall value decreased from {offerLeft.valueScore} to {offerRight.valueScore}</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

