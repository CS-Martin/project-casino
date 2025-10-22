import { v } from 'convex/values';
import { query, QueryCtx } from '../../_generated/server';

export const getDiscoveryLogsArgs = {
  limit: v.optional(v.number()),
};

export const getDiscoveryLogsHandler = async (ctx: QueryCtx, args: { limit?: number }) => {
  const limit = args.limit || 10;

  // Get the most recent logs
  const logs = await ctx.db.query('casino_discovery_logs').withIndex('by_timestamp').order('desc').take(limit);

  // Calculate stats
  const totalRuns = await ctx.db.query('casino_discovery_logs').collect();
  const successfulRuns = totalRuns.filter((log) => log.success).length;
  const totalDiscovered = totalRuns.reduce((sum, log) => sum + log.casinos_discovered, 0);
  const totalSaved = totalRuns.reduce((sum, log) => sum + log.casinos_saved, 0);

  return {
    logs,
    stats: {
      totalRuns: totalRuns.length,
      successfulRuns,
      totalDiscovered,
      totalSaved,
    },
  };
};
