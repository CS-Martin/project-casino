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
    Sparkles,
    Award,
    CheckCircle,
    Info,
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
    const [aiAnalysis, setAiAnalysis] = React.useState<any | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [showAiAnalysis, setShowAiAnalysis] = React.useState(false);
    const [isCached, setIsCached] = React.useState(false);

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

    const handleAiAnalysis = async () => {
        if (!casinoDetail || activeOffers.length === 0) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/determine-best-offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    casinoName: casinoDetail.casino.name,
                    casinoId: casinoDetail.casino._id,
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
                setShowAiAnalysis(true);
                setIsCached(data.cached || false);

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

                        {/* AI Analysis Results */}
                        {showAiAnalysis && aiAnalysis && (
                            <div className="bg-linear-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-purple-950/50 rounded-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Award className="h-6 w-6 text-purple-600" />
                                        <h4 className="font-bold text-lg">AI Recommended Best Offer</h4>
                                        {isCached && (
                                            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                                                ⚡ Cached
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAiAnalysis(false)}
                                        className="h-6 w-6 p-0"
                                    >
                                        ×
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {/* Best Offer Highlight */}
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-purple-600">Best Offer</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-purple-600">{aiAnalysis.score}/100</span>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-lg">
                                            {activeOffers.find(o => o._id === aiAnalysis.bestOfferId)?.offer_name}
                                        </p>
                                    </div>

                                    {/* Reasoning */}
                                    <div>
                                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Why This Offer?
                                        </h5>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {aiAnalysis.reasoning}
                                        </p>
                                    </div>

                                    {/* Strengths */}
                                    <div>
                                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            Strengths
                                        </h5>
                                        <ul className="space-y-1">
                                            {aiAnalysis.strengths.map((strength: string, idx: number) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <span className="text-green-600 mt-0.5">✓</span>
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Considerations */}
                                    <div>
                                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                            Important Considerations
                                        </h5>
                                        <ul className="space-y-1">
                                            {aiAnalysis.considerations.map((consideration: string, idx: number) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <span className="text-orange-600 mt-0.5">!</span>
                                                    <span>{consideration}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Ranking Factors */}
                                    <div>
                                        <h5 className="font-semibold mb-3">Ranking Factors</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Value Score</span>
                                                    <span className="font-semibold">{aiAnalysis.rankingFactors.valueScore}/10</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-600"
                                                        style={{ width: `${aiAnalysis.rankingFactors.valueScore * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Bonus Amount</span>
                                                    <span className="font-semibold">{aiAnalysis.rankingFactors.bonusAmount}/10</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-600"
                                                        style={{ width: `${aiAnalysis.rankingFactors.bonusAmount * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Wagering</span>
                                                    <span className="font-semibold">{aiAnalysis.rankingFactors.wageringRequirement}/10</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600"
                                                        style={{ width: `${aiAnalysis.rankingFactors.wageringRequirement * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Ease of Use</span>
                                                    <span className="font-semibold">{aiAnalysis.rankingFactors.easeOfUse}/10</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-orange-600"
                                                        style={{ width: `${aiAnalysis.rankingFactors.easeOfUse * 10}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground italic">
                                            ✨ Analysis powered by AI. Always review full offer terms before claiming.
                                        </p>
                                    </div>
                                </div>
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

