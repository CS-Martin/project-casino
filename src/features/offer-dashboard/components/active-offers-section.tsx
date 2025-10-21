'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, GitCompare, Sparkles } from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import { OfferCard } from './offer-card';
import { AiOfferAnalysis } from './ai-offer-analysis';

interface ActiveOffersSectionProps {
    activeOffers: OfferWithChanges[];
    casinoId: string;
    casinoName: string;
    onOfferClick: (offer: OfferWithChanges) => void;
}

export function ActiveOffersSection({
    activeOffers,
    casinoId,
    casinoName,
    onOfferClick,
}: ActiveOffersSectionProps) {
    const [comparisonMode, setComparisonMode] = React.useState(false);
    const [selectedOfferLeft, setSelectedOfferLeft] = React.useState<OfferWithChanges | null>(null);
    const [selectedOfferRight, setSelectedOfferRight] = React.useState<OfferWithChanges | null>(null);
    const [aiAnalysis, setAiAnalysis] = React.useState<any | null>(null);
    const [isLoadingCache, setIsLoadingCache] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);

    // Load cached AI analysis when component mounts
    React.useEffect(() => {
        const loadCachedAnalysis = async () => {
            if (!casinoId) {
                setAiAnalysis(null);
                return;
            }

            setIsLoadingCache(true);
            try {
                const response = await fetch(`/api/get-cached-best-offer?casinoId=${casinoId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    setAiAnalysis(data.data);
                    console.log('✅ Loaded best offer recommendation from cache');
                } else {
                    setAiAnalysis(null);
                    console.log('ℹ️  No cached best offer recommendation found');
                }
            } catch (error) {
                console.error('Error loading cached analysis:', error);
                setAiAnalysis(null);
            } finally {
                setIsLoadingCache(false);
            }
        };

        loadCachedAnalysis();
    }, [casinoId]);

    const handleOfferClick = (offer: OfferWithChanges) => {
        if (comparisonMode) {
            if (!selectedOfferLeft) {
                setSelectedOfferLeft(offer);
            } else if (!selectedOfferRight) {
                setSelectedOfferRight(offer);
                // Parent component will handle opening comparison modal
                onOfferClick(offer);
            }
        } else {
            onOfferClick(offer);
        }
    };

    const toggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        setSelectedOfferLeft(null);
        setSelectedOfferRight(null);
    };

    const handleAiAnalysis = async () => {
        if (activeOffers.length === 0) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/determine-best-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    casinoName,
                    casinoId,
                    offers: activeOffers.map(offer => ({
                        _id: offer._id,
                        offer_name: offer.offer_name,
                        offer_type: offer.offer_type,
                        description: offer.description,
                        expected_bonus: offer.expected_bonus,
                        expected_deposit: offer.expected_deposit,
                        wagering_requirement: offer.wagering_requirement,
                        max_bonus: offer.max_bonus,
                        min_deposit: offer.min_deposit,
                        valid_until: offer.valid_until,
                        terms: offer.terms,
                        valueScore: offer.valueScore,
                    })),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAiAnalysis(data.data);

                // Log cache status
                if (data.cached) {
                    console.log('✅ Loaded best offer from cache');
                } else {
                    console.log('🤖 Generated new best offer analysis with AI');
                }
            } else {
                console.error('AI analysis failed:', data.error);
            }
        } catch (error) {
            console.error('Error calling AI analysis:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (activeOffers.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active offers found for this casino</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    Active Offers ({activeOffers.length})
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing || activeOffers.length < 2}
                        className="flex items-center gap-2 w-full sm:w-auto bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/40 dark:hover:to-blue-900/40 border-purple-200 dark:border-purple-800"
                    >
                        {isAnalyzing ? (
                            <>
                                <Sparkles className="h-4 w-4 animate-spin" />
                                <span className="hidden sm:inline">Analyzing...</span>
                                <span className="sm:hidden">AI...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span className="hidden sm:inline">AI Best Offer</span>
                                <span className="sm:hidden">AI Best</span>
                            </>
                        )}
                    </Button>
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

            <AiOfferAnalysis
                aiAnalysis={aiAnalysis}
                isAnalyzing={isAnalyzing}
                activeOffers={activeOffers}
                onClose={() => setAiAnalysis(null)}
            />

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeOffers.map((offer) => (
                    <OfferCard
                        key={offer._id}
                        offer={offer}
                        isSelectedForComparison={
                            comparisonMode &&
                            (selectedOfferLeft?._id === offer._id || selectedOfferRight?._id === offer._id)
                        }
                        comparisonPosition={
                            selectedOfferLeft?._id === offer._id ? 'Left' : 'Right'
                        }
                        onClick={handleOfferClick}
                    />
                ))}
            </div>
        </div>
    );
}

