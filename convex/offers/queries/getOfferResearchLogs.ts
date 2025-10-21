import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getOfferResearchLogsArgs = {
  limit: v.optional(v.number()),
  level: v.optional(v.string()),
} as const;

export const getOfferResearchLogsHandler = async (ctx: QueryCtx, args: { limit?: number; level?: string }) => {
  const limit = args.limit || 50;
  const level = args.level;

  // Get recent offer research activity from the offers table
  const recentOffers = await ctx.db
    .query('offers')
    .withIndex('by_source', (q) => q.eq('source', 'ai_research'))
    .order('desc')
    .take(limit);

  // Get recent casino updates
  const recentCasinoUpdates = await ctx.db
    .query('casinos')
    .filter((q) => q.neq(q.field('last_offer_check'), undefined))
    .order('desc')
    .take(limit);

  // Transform into log-like entries
  const logs = [
    ...recentOffers.map((offer) => ({
      timestamp: offer.updated_at,
      level: 'info',
      message: `Offer ${offer.is_deprecated ? 'deprecated' : 'updated'}: ${offer.offer_name}`,
      context: {
        casinoId: offer.casino_id,
        offerType: offer.offer_type,
        bonus: offer.expected_bonus,
        deposit: offer.expected_deposit,
      },
    })),
    ...recentCasinoUpdates.map((casino) => ({
      timestamp: casino.last_offer_check!,
      level: 'info',
      message: `Casino offer research completed: ${casino.name}`,
      context: {
        casinoId: casino._id,
        isTracked: casino.is_tracked,
      },
    })),
  ];

  // Sort by timestamp and apply filters
  const sortedLogs = logs
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .filter((log) => !level || log.level === level)
    .slice(0, limit);

  return {
    logs: sortedLogs,
    total: sortedLogs.length,
    levels: ['debug', 'info', 'warn', 'error'],
  };
};
