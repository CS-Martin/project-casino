import { Id } from '../../_generated/dataModel';
import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinoDetailWithOffersArgs = {
  casinoId: v.id('casinos'),
} as const;

export interface OfferWithChanges {
  _id: string;
  _creationTime: number;
  offer_name: string;
  offer_type?: string;
  expected_deposit?: number;
  expected_bonus?: number;
  description?: string;
  terms?: string;
  valid_until?: string;
  wagering_requirement?: number;
  min_deposit?: number;
  max_bonus?: number;
  source?: string;
  is_deprecated?: boolean;
  updated_at?: number;
  isExpired: boolean;
  isActive: boolean;
  valueScore: number;
  daysSinceUpdate: number;
}

export interface CasinoDetailWithOffers {
  casino: {
    _id: string;
    name: string;
    website?: string;
    license_status?: string;
    source_url?: string;
    last_offer_check: number | null;
    is_tracked: boolean;
  };
  state: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  activeOffers: OfferWithChanges[];
  expiredOffers: OfferWithChanges[];
  deprecatedOffers: OfferWithChanges[];
  stats: {
    totalOffers: number;
    activeCount: number;
    expiredCount: number;
    deprecatedCount: number;
    avgBonusAmount: number;
    avgWageringRequirement: number;
    highestBonus: number;
    bestValueScore: number;
    daysSinceLastCheck: number | null;
  };
}

export const getCasinoDetailWithOffersHandler = async (
  ctx: QueryCtx,
  args: { casinoId: string }
): Promise<CasinoDetailWithOffers | null> => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Get casino
  const casino = await ctx.db.get(args.casinoId as Id<'casinos'>);
  if (!casino) return null;

  // Get state
  const state = await ctx.db.get(casino.state_id);
  if (!state) return null;

  // Get all offers for this casino
  const allOffers = await ctx.db
    .query('offers')
    .withIndex('by_casino', (q) => q.eq('casino_id', args.casinoId as any))
    .collect();

  // Process and categorize offers
  const activeOffers: OfferWithChanges[] = [];
  const expiredOffers: OfferWithChanges[] = [];
  const deprecatedOffers: OfferWithChanges[] = [];

  let totalBonus = 0;
  let totalWagering = 0;
  let highestBonus = 0;
  let bestValueScore = 0;

  allOffers.forEach((offer) => {
    const isExpired = offer.valid_until && new Date(offer.valid_until).getTime() <= now;
    const isActive = !offer.is_deprecated && !isExpired;

    const bonusAmount = offer.expected_bonus || 0;
    const wageringReq = offer.wagering_requirement || 0;
    const valueScore = wageringReq > 0 ? Math.round((bonusAmount / wageringReq) * 10) / 10 : 0;

    const daysSinceUpdate = offer.updated_at
      ? Math.floor((now - offer.updated_at) / oneDayMs)
      : Math.floor((now - offer._creationTime) / oneDayMs);

    const offerWithChanges: OfferWithChanges = {
      _id: offer._id,
      _creationTime: offer._creationTime,
      offer_name: offer.offer_name,
      offer_type: offer.offer_type,
      expected_deposit: offer.expected_deposit,
      expected_bonus: offer.expected_bonus,
      description: offer.description,
      terms: offer.terms,
      valid_until: offer.valid_until,
      wagering_requirement: offer.wagering_requirement,
      min_deposit: offer.min_deposit,
      max_bonus: offer.max_bonus,
      source: offer.source,
      is_deprecated: offer.is_deprecated,
      updated_at: offer.updated_at,
      isExpired: !!isExpired,
      isActive,
      valueScore,
      daysSinceUpdate,
    };

    if (offer.is_deprecated) {
      deprecatedOffers.push(offerWithChanges);
    } else if (isExpired) {
      expiredOffers.push(offerWithChanges);
    } else {
      activeOffers.push(offerWithChanges);
      totalBonus += bonusAmount;
      totalWagering += wageringReq;
      highestBonus = Math.max(highestBonus, bonusAmount);
      bestValueScore = Math.max(bestValueScore, valueScore);
    }
  });

  const activeCount = activeOffers.length;
  const avgBonusAmount = activeCount > 0 ? Math.round(totalBonus / activeCount) : 0;
  const avgWageringRequirement = activeCount > 0 ? Math.round(totalWagering / activeCount) : 0;

  const daysSinceLastCheck = casino.last_offer_check ? Math.floor((now - casino.last_offer_check) / oneDayMs) : null;

  // Sort offers by creation time (newest first)
  activeOffers.sort((a, b) => b._creationTime - a._creationTime);
  expiredOffers.sort((a, b) => b._creationTime - a._creationTime);
  deprecatedOffers.sort((a, b) => b._creationTime - a._creationTime);

  return {
    casino: {
      _id: casino._id,
      name: casino.name,
      website: casino.website,
      license_status: casino.license_status,
      source_url: casino.source_url,
      last_offer_check: casino.last_offer_check || null,
      is_tracked: casino.is_tracked,
    },
    state: {
      _id: state._id,
      name: state.name,
      abbreviation: state.abbreviation,
    },
    activeOffers,
    expiredOffers,
    deprecatedOffers,
    stats: {
      totalOffers: allOffers.length,
      activeCount,
      expiredCount: expiredOffers.length,
      deprecatedCount: deprecatedOffers.length,
      avgBonusAmount,
      avgWageringRequirement,
      highestBonus,
      bestValueScore,
      daysSinceLastCheck,
    },
  };
};
