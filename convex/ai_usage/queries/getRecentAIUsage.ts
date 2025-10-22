import { v } from 'convex/values';
import { QueryCtx } from '../../_generated/server';

export const getRecentAIUsageArgs = {
  limit: v.optional(v.number()),
};

type GetRecentAIUsageArgs = {
  limit?: number;
};

export const getRecentAIUsageHandler = async (ctx: QueryCtx, args: GetRecentAIUsageArgs) => {
  const limit = args.limit || 50;

  const recentUsage = await ctx.db.query('ai_usage').order('desc').take(limit);

  return recentUsage;
};
