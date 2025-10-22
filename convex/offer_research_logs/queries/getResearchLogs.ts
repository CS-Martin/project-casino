import { query } from '../../_generated/server';
import { v } from 'convex/values';

export const getResearchLogsArgs = {
  limit: v.optional(v.number()),
  triggeredBy: v.optional(v.string()),
};

export const getResearchLogsHandler = async (ctx: any, args: { limit?: number; triggeredBy?: string }) => {
  const limit = args.limit || 50;

  let logsQuery = ctx.db.query('offer_research_logs').order('desc');

  // Filter by triggered_by if provided
  if (args.triggeredBy) {
    logsQuery = logsQuery.filter((q: any) => q.eq(q.field('triggered_by'), args.triggeredBy));
  }

  const logs = await logsQuery.take(limit);

  // Calculate summary stats
  const totalCasinosResearched = logs.reduce((sum: number, log: any) => sum + log.casinos_researched, 0);
  const totalOffersCreated = logs.reduce((sum: number, log: any) => sum + log.offers_created, 0);
  const totalOffersUpdated = logs.reduce((sum: number, log: any) => sum + log.offers_updated, 0);
  const totalOffersSkipped = logs.reduce((sum: number, log: any) => sum + log.offers_skipped, 0);
  const averageDuration =
    logs.length > 0 ? logs.reduce((sum: number, log: any) => sum + log.duration_ms, 0) / logs.length : 0;

  return {
    logs,
    stats: {
      totalCasinosResearched,
      totalOffersCreated,
      totalOffersUpdated,
      totalOffersSkipped,
      averageDuration: Math.round(averageDuration),
      totalRuns: logs.length,
    },
  };
};
