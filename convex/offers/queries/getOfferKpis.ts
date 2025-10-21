import { query, QueryCtx } from '../../_generated/server';

export const getOfferKpisArgs = {} as const;

export interface OfferKpis {
  // Total offers (all time)
  totalOffers: number;

  // Casinos with offers (count and percentage)
  casinosWithOffers: number;
  totalCasinos: number;
  casinosWithOffersPercentage: number;

  // Active offers (current, not expired)
  activeOffers: number;

  // Offers researched today
  offersResearchedToday: number;
}

export const getOfferKpisHandler = async (ctx: QueryCtx): Promise<OfferKpis> => {
  const now = Date.now();

  // Get all offers
  const allOffers = await ctx.db.query('offers').collect();

  // Get all casinos
  const allCasinos = await ctx.db.query('casinos').collect();

  // Calculate total offers (all time)
  const totalOffers = allOffers.length;

  // Calculate casinos with offers
  const casinosWithOffers = new Set(allOffers.map((offer) => offer.casino_id)).size;
  const totalCasinos = allCasinos.length;
  const casinosWithOffersPercentage = totalCasinos > 0 ? Math.round((casinosWithOffers / totalCasinos) * 100) : 0;

  // Calculate active offers (not expired and not deprecated)
  const activeOffers = allOffers.filter((offer) => {
    const isExpired = offer.valid_until && new Date(offer.valid_until).getTime() <= now;
    return !offer.is_deprecated && !isExpired;
  }).length;

  // Calculate offers researched today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const offersResearchedToday = allOffers.filter((offer) => {
    return offer._creationTime >= startOfToday.getTime();
  }).length;

  return {
    totalOffers,
    casinosWithOffers,
    totalCasinos,
    casinosWithOffersPercentage,
    activeOffers,
    offersResearchedToday,
  };
};
