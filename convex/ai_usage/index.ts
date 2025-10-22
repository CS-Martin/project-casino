import { mutation, query } from '../_generated/server';
import { logAIUsageArgs, logAIUsageHandler } from './mutations/logAIUsage';
import { getAIUsageStatsArgs, getAIUsageStatsHandler } from './queries/getAIUsageStats';
import { getRecentAIUsageArgs, getRecentAIUsageHandler } from './queries/getRecentAIUsage';

export const logAIUsage = mutation({
  args: logAIUsageArgs,
  handler: logAIUsageHandler,
});

export const getAIUsageStats = query({
  args: getAIUsageStatsArgs,
  handler: getAIUsageStatsHandler,
});

export const getRecentAIUsage = query({
  args: getRecentAIUsageArgs,
  handler: getRecentAIUsageHandler,
});
