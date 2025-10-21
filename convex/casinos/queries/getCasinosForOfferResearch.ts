import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinosForOfferResearchArgs = {
  batchSize: v.optional(v.number()),
};

export const getCasinosForOfferResearchHandler = async (ctx: QueryCtx, args: { batchSize?: number }) => {
  const batchSize = args.batchSize || 30;

  // PRIORITY 1: Get tracked casinos that have NEVER been searched (last_offer_check is null)
  const trackedCasinosNeverSearched = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', true))
    .filter((q) => q.eq(q.field('last_offer_check'), undefined))
    .take(batchSize);

  // If we have enough tracked casinos that were never searched, return them
  if (trackedCasinosNeverSearched.length >= batchSize) {
    return trackedCasinosNeverSearched;
  }

  // PRIORITY 2: If not enough tracked casinos never searched, get untracked casinos that were never searched
  const remainingSlots = batchSize - trackedCasinosNeverSearched.length;
  const untrackedCasinosNeverSearched = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', false))
    .filter((q) => q.eq(q.field('last_offer_check'), undefined))
    .take(remainingSlots);

  // If we have enough casinos that were never searched, return them
  if (trackedCasinosNeverSearched.length + untrackedCasinosNeverSearched.length >= batchSize) {
    return [...trackedCasinosNeverSearched, ...untrackedCasinosNeverSearched];
  }

  // PRIORITY 3: If still not enough, get tracked casinos with oldest timestamps
  const stillNeeded = batchSize - trackedCasinosNeverSearched.length - untrackedCasinosNeverSearched.length;
  const trackedCasinosOldest = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', true))
    .filter((q) => q.neq(q.field('last_offer_check'), undefined))
    .order('asc') // oldest timestamps first
    .take(stillNeeded);

  return [...trackedCasinosNeverSearched, ...untrackedCasinosNeverSearched, ...trackedCasinosOldest];
};
