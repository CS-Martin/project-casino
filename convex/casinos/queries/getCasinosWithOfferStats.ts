import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';

export const getCasinosWithOfferStatsArgs = {
  stateId: v.optional(v.id('states')),
  status: v.optional(v.union(v.literal('current'), v.literal('stale'), v.literal('missing'), v.literal('all'))),
  paginationOpts: paginationOptsValidator,
} as const;

export type CasinoResearchStatus = 'current' | 'stale' | 'missing';

export interface CasinoWithOfferStats {
  _id: string;
  name: string;
  state: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  activeOffersCount: number;
  historicalOffersCount: number;
  lastOfferCheck: number | null;
  avgBonusAmount: number;
  avgWageringRequirement: number;
  status: CasinoResearchStatus;
  daysSinceLastCheck: number | null;
  isTracked: boolean;
}

export const getCasinosWithOfferStatsHandler = async (
  ctx: QueryCtx,
  args: {
    stateId?: string;
    status?: 'current' | 'stale' | 'missing' | 'all';
    paginationOpts: { numItems: number; cursor: string | null };
  }
) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;

  // Get paginated casinos, optionally filtered by state
  // We'll fetch more than needed to account for filtering, then paginate the results
  const casinoQuery = args.stateId
    ? ctx.db.query('casinos').withIndex('by_state', (q) => q.eq('state_id', args.stateId as any))
    : ctx.db.query('casinos');

  // Fetch a larger batch to account for status filtering
  const batchSize = args.paginationOpts.numItems * 3; // 3x to account for filtering
  const casinosPaginated = await casinoQuery.paginate(args.paginationOpts);

  // Get all offers for these casinos
  const allOffers = await ctx.db.query('offers').collect();

  // Get all states for lookup
  const states = await ctx.db.query('states').collect();
  const stateMap = new Map(states.map((s) => [s._id, s]));

  // Process each casino
  const casinosWithStats: CasinoWithOfferStats[] = [];

  for (const casino of casinosPaginated.page) {
    // Get offers for this casino
    const casinoOffers = allOffers.filter((offer) => offer.casino_id === casino._id);

    // Count active offers (not deprecated, not expired)
    const activeOffers = casinoOffers.filter((offer) => {
      const isExpired = offer.valid_until && new Date(offer.valid_until).getTime() <= now;
      return !offer.is_deprecated && !isExpired;
    });

    const activeOffersCount = activeOffers.length;
    const historicalOffersCount = casinoOffers.length;

    // Calculate average bonus and wagering for active offers
    let avgBonusAmount = 0;
    let avgWageringRequirement = 0;

    if (activeOffers.length > 0) {
      const totalBonus = activeOffers.reduce((sum, offer) => sum + (offer.expected_bonus || 0), 0);
      const totalWagering = activeOffers.reduce((sum, offer) => sum + (offer.wagering_requirement || 0), 0);

      avgBonusAmount = Math.round(totalBonus / activeOffers.length);
      avgWageringRequirement = Math.round(totalWagering / activeOffers.length);
    }

    // Determine status based on last_offer_check
    let status: CasinoResearchStatus = 'missing';
    let daysSinceLastCheck: number | null = null;

    if (casino.last_offer_check) {
      const timeSinceCheck = now - casino.last_offer_check;
      daysSinceLastCheck = Math.floor(timeSinceCheck / oneDayMs);

      if (timeSinceCheck < sevenDaysMs) {
        status = 'current';
      } else {
        status = 'stale';
      }
    }

    // Get state info
    const state = stateMap.get(casino.state_id);
    if (!state) continue; // Skip if state not found

    const casinoWithStats: CasinoWithOfferStats = {
      _id: casino._id,
      name: casino.name,
      state: {
        _id: state._id,
        name: state.name,
        abbreviation: state.abbreviation,
      },
      activeOffersCount,
      historicalOffersCount,
      lastOfferCheck: casino.last_offer_check || null,
      avgBonusAmount,
      avgWageringRequirement,
      status,
      daysSinceLastCheck,
      isTracked: casino.is_tracked,
    };

    // Filter by status if specified
    if (args.status && args.status !== 'all' && status !== args.status) {
      continue;
    }

    casinosWithStats.push(casinoWithStats);
  }

  // Sort by last check date (most recent first), nulls last
  casinosWithStats.sort((a, b) => {
    if (a.lastOfferCheck === null && b.lastOfferCheck === null) return 0;
    if (a.lastOfferCheck === null) return 1;
    if (b.lastOfferCheck === null) return -1;
    return b.lastOfferCheck - a.lastOfferCheck;
  });

  // Apply pagination to the filtered and sorted results
  const startIndex = 0;
  const endIndex = args.paginationOpts.numItems;
  const paginatedResults = casinosWithStats.slice(startIndex, endIndex);

  // Determine if there are more results
  const isDone = casinosWithStats.length <= args.paginationOpts.numItems && casinosPaginated.isDone;

  return {
    page: paginatedResults,
    isDone,
    continueCursor: casinosPaginated.continueCursor,
  };
};
