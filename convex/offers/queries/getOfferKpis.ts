import { query, QueryCtx } from '../../_generated/server';

export const getOfferKpisArgs = {} as const;

export interface OfferKpis {
  // Total active offers (latest offers per casino with recent last_offer_check and not expired)
  totalActiveOffers: number;

  // Total offers created
  totalNewOffers: number;

  // Total offers expired or no longer active
  totalExpiredOffers: number;

  // Average lifetime of offers (duration from creation to expiration or current date for active offers)
  averageOfferLifetime: number; // in days

  // Number of casinos with updated offers
  totalCasinosWithUpdatedOffers: number;

  // Additional metrics for context
  totalOffers: number;
  totalDeprecatedOffers: number;
  totalCasinosWithOffers: number;
}

export const getOfferKpisHandler = async (ctx: QueryCtx): Promise<OfferKpis> => {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Get all offers (using index for better performance)
  const allOffers = await ctx.db.query('offers').collect();

  // Get all casinos with their last_offer_check
  const allCasinos = await ctx.db.query('casinos').collect();

  // Filter casinos with recent offer checks (within last 7 days)
  const recentlyCheckedCasinos = allCasinos.filter(
    (casino) => casino.last_offer_check && casino.last_offer_check > sevenDaysAgo
  );

  // Get latest offers per casino (for active offers calculation)
  const latestOffersByCasino = new Map<string, any>();
  allOffers.forEach((offer) => {
    const existing = latestOffersByCasino.get(offer.casino_id);
    if (!existing || offer._creationTime > existing._creationTime) {
      latestOffersByCasino.set(offer.casino_id, offer);
    }
  });

  // Calculate total active offers (latest offers from recently checked casinos that are not deprecated)
  const totalActiveOffers = Array.from(latestOffersByCasino.values()).filter((offer) => {
    const casino = allCasinos.find((c) => c._id === offer.casino_id);
    return (
      casino &&
      casino.last_offer_check &&
      casino.last_offer_check > sevenDaysAgo &&
      !offer.is_deprecated &&
      (!offer.valid_until || new Date(offer.valid_until).getTime() > now)
    );
  }).length;

  // Calculate total new offers
  const totalNewOffers = allOffers.length;

  // Calculate total expired/deprecated offers
  const totalExpiredOffers = allOffers.filter((offer) => {
    const isExpired = offer.is_deprecated || (offer.valid_until && new Date(offer.valid_until).getTime() <= now);
    return isExpired;
  }).length;

  // Calculate average offer lifetime
  const offerLifetimes: number[] = [];
  allOffers.forEach((offer) => {
    const creationTime = offer._creationTime;
    const expirationTime =
      offer.is_deprecated && offer.updated_at
        ? offer.updated_at
        : offer.valid_until
          ? new Date(offer.valid_until).getTime()
          : now; // For active offers, use current time

    const lifetimeInDays = (expirationTime - creationTime) / (24 * 60 * 60 * 1000);
    if (lifetimeInDays > 0) {
      offerLifetimes.push(lifetimeInDays);
    }
  });

  const averageOfferLifetime =
    offerLifetimes.length > 0 ? offerLifetimes.reduce((sum, lifetime) => sum + lifetime, 0) / offerLifetimes.length : 0;

  // Calculate total casinos with updated offers
  const totalCasinosWithUpdatedOffers = new Set(
    allOffers.filter((offer) => offer.updated_at).map((offer) => offer.casino_id)
  ).size;

  // Additional metrics
  const totalOffers = allOffers.length;
  const totalDeprecatedOffers = allOffers.filter((offer) => offer.is_deprecated).length;
  const totalCasinosWithOffers = new Set(allOffers.map((offer) => offer.casino_id)).size;

  return {
    totalActiveOffers,
    totalNewOffers,
    totalExpiredOffers,
    averageOfferLifetime: Math.round(averageOfferLifetime * 10) / 10, // Round to 1 decimal place
    totalCasinosWithUpdatedOffers,
    totalOffers,
    totalDeprecatedOffers,
    totalCasinosWithOffers,
  };
};
