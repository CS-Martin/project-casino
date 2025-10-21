import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    DollarSign,
    TrendingUp,
    Gift,
    Eye,
} from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';

interface OfferCardProps {
    offer: OfferWithChanges;
    isSelectedForComparison?: boolean;
    comparisonPosition?: 'Left' | 'Right';
    onClick: (offer: OfferWithChanges) => void;
}

export function OfferCard({
    offer,
    isSelectedForComparison = false,
    comparisonPosition,
    onClick,
}: OfferCardProps) {
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

    return (
        <div
            className={`p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group ${isSelectedForComparison ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' : ''
                }`}
            onClick={() => onClick(offer)}
        >
            <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {isSelectedForComparison && comparisonPosition && (
                            <Badge className="bg-purple-500 text-xs">
                                {comparisonPosition}
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
                        onClick(offer);
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

