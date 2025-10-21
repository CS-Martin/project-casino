import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinosForOfferResearchArgs = {
  batchSize: v.optional(v.number()),
};

export const getCasinosForOfferResearchHandler = async (ctx: QueryCtx, args: { batchSize?: number }) => {
  const batchSize = args.batchSize || 30;

  // First, try to get tracked casinos that need offer research
  const trackedCasinos = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', true))
    .order('asc') // null values first, then oldest timestamps
    .take(batchSize);

  // If we have enough tracked casinos, return them
  if (trackedCasinos.length >= batchSize) {
    return trackedCasinos;
  }

  // If we need more casinos, get untracked ones
  const remainingSlots = batchSize - trackedCasinos.length;
  const untrackedCasinos = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', false))
    .order('asc') // null values first, then oldest timestamps
    .take(remainingSlots);

  return [...trackedCasinos, ...untrackedCasinos];
};
