import { query, QueryCtx } from '../../_generated/server';

export const getOfferResearchStatusArgs = {};

export const getOfferResearchStatusHandler = async (ctx: QueryCtx, args: { limit?: number; level?: string }) => {
  // Get statistics about tracked vs untracked casinos
  const trackedCasinos = await ctx.db
    .query('casinos')
    .withIndex('tracked_casinos', (q) => q.eq('is_tracked', true))
    .collect();

  const untrackedCasinos = await ctx.db
    .query('casinos')
    .withIndex('tracked_casinos', (q) => q.eq('is_tracked', false))
    .collect();

  // Count casinos by last_offer_check status
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const trackedStats = {
    total: trackedCasinos.length,
    neverChecked: trackedCasinos.filter((c) => !c.last_offer_check).length,
    checkedToday: trackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check > oneDayAgo).length,
    checkedThisWeek: trackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check > oneWeekAgo).length,
    checkedLongAgo: trackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check <= oneWeekAgo).length,
  };

  const untrackedStats = {
    total: untrackedCasinos.length,
    neverChecked: untrackedCasinos.filter((c) => !c.last_offer_check).length,
    checkedToday: untrackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check > oneDayAgo).length,
    checkedThisWeek: untrackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check > oneWeekAgo).length,
    checkedLongAgo: untrackedCasinos.filter((c) => c.last_offer_check && c.last_offer_check <= oneWeekAgo).length,
  };

  // Get recent offer statistics
  const recentOffers = await ctx.db
    .query('offers')
    .withIndex('by_source', (q) => q.eq('source', 'ai_research'))
    .filter((q) => q.gt(q.field('_creationTime'), oneWeekAgo))
    .collect();

  const offerStats = {
    totalRecent: recentOffers.length,
    createdThisWeek: recentOffers.filter((o) => o._creationTime > oneWeekAgo).length,
    updatedThisWeek: recentOffers.filter(
      (o) => o.updated_at && o.updated_at > oneWeekAgo && o.updated_at !== o._creationTime
    ).length,
    deprecatedThisWeek: recentOffers.filter((o) => o.is_deprecated).length,
  };

  // Get casinos that need research (oldest last_offer_check or never checked)
  const casinosNeedingResearch = await ctx.db
    .query('casinos')
    .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', true))
    .order('asc')
    .take(10);

  return {
    trackedCasinos: trackedStats,
    untrackedCasinos: untrackedStats,
    recentOffers: offerStats,
    nextCandidates: casinosNeedingResearch.map((c) => ({
      id: c._id,
      name: c.name,
      lastOfferCheck: c.last_offer_check,
      daysSinceLastCheck: c.last_offer_check ? Math.floor((now - c.last_offer_check) / (24 * 60 * 60 * 1000)) : null,
    })),
    lastUpdated: now,
  };
};
