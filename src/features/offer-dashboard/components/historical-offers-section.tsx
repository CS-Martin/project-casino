import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { OfferWithChanges } from '@convex/casinos/queries/getCasinoDetailWithOffers';
import { OfferCard } from './offer-card';

interface HistoricalOffersSectionProps {
    expiredOffers: OfferWithChanges[];
    deprecatedOffers: OfferWithChanges[];
    onOfferClick: (offer: OfferWithChanges) => void;
}

export function HistoricalOffersSection({
    expiredOffers,
    deprecatedOffers,
    onOfferClick,
}: HistoricalOffersSectionProps) {
    const totalHistoricalOffers = expiredOffers.length + deprecatedOffers.length;

    if (totalHistoricalOffers === 0) {
        return null;
    }

    return (
        <>
            <Separator />
            <details className="space-y-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Historical Offers ({totalHistoricalOffers})
                </summary>
                <div className="space-y-4 mt-3">
                    {expiredOffers.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Expired ({expiredOffers.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {expiredOffers.slice(0, 5).map((offer) => (
                                    <OfferCard
                                        key={offer._id}
                                        offer={offer}
                                        onClick={onOfferClick}
                                    />
                                ))}
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
                                {deprecatedOffers.slice(0, 5).map((offer) => (
                                    <OfferCard
                                        key={offer._id}
                                        offer={offer}
                                        onClick={onOfferClick}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </details>
        </>
    );
}

