import { query, QueryCtx } from '../../_generated/server';

export const getOfferTypeBreakdownArgs = {} as const;

export interface OfferTypeBreakdownItem {
  offerType: string;
  count: number;
  percentage: number;
}

export const getOfferTypeBreakdownHandler = async (ctx: QueryCtx): Promise<OfferTypeBreakdownItem[]> => {
  // Get all non-deprecated offers
  const allOffers = await ctx.db.query('offers').collect();

  const now = Date.now();

  // Filter to only active (non-deprecated and non-expired) offers
  const activeOffers = allOffers.filter((offer) => {
    const isExpired = offer.valid_until && new Date(offer.valid_until).getTime() <= now;
    return !offer.is_deprecated && !isExpired;
  });

  // Count by offer type
  const typeCount = new Map<string, number>();

  activeOffers.forEach((offer) => {
    const type = offer.offer_type || 'Unknown';
    typeCount.set(type, (typeCount.get(type) || 0) + 1);
  });

  const total = activeOffers.length;

  // Convert to array and calculate percentages
  const breakdown: OfferTypeBreakdownItem[] = Array.from(typeCount.entries())
    .map(([offerType, count]) => ({
      offerType,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return breakdown;
};
