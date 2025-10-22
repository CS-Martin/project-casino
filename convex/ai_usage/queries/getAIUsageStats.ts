import { v } from 'convex/values';
import { QueryCtx } from '../../_generated/server';

export const getAIUsageStatsArgs = {
  // Time range in milliseconds (e.g., last 24 hours, last 7 days)
  since: v.optional(v.number()),
};

type GetAIUsageStatsArgs = {
  since?: number;
};

export const getAIUsageStatsHandler = async (ctx: QueryCtx, args: GetAIUsageStatsArgs) => {
  const cutoffTime = args.since || Date.now() - 24 * 60 * 60 * 1000; // Default: last 24 hours

  // Get all usage records since cutoff
  const usageRecords = await ctx.db
    .query('ai_usage')
    .filter((q) => q.gte(q.field('_creationTime'), cutoffTime))
    .collect();

  // Calculate total stats
  const totalStats = usageRecords.reduce(
    (acc, record) => ({
      totalCalls: acc.totalCalls + 1,
      successfulCalls: acc.successfulCalls + (record.success ? 1 : 0),
      failedCalls: acc.failedCalls + (record.success ? 0 : 1),
      totalTokens: acc.totalTokens + record.total_tokens,
      inputTokens: acc.inputTokens + record.input_tokens,
      outputTokens: acc.outputTokens + record.output_tokens,
      totalCost: acc.totalCost + record.estimated_cost,
      totalDuration: acc.totalDuration + (record.duration_ms || 0),
    }),
    {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      totalDuration: 0,
    }
  );

  // Group by operation
  const byOperation = usageRecords.reduce(
    (acc, record) => {
      if (!acc[record.operation]) {
        acc[record.operation] = {
          calls: 0,
          tokens: 0,
          cost: 0,
          avgDuration: 0,
          successRate: 0,
        };
      }

      acc[record.operation].calls += 1;
      acc[record.operation].tokens += record.total_tokens;
      acc[record.operation].cost += record.estimated_cost;

      return acc;
    },
    {} as Record<string, { calls: number; tokens: number; cost: number; avgDuration: number; successRate: number }>
  );

  // Calculate averages and success rates for each operation
  Object.entries(byOperation).forEach(([operation, stats]) => {
    const operationRecords = usageRecords.filter((r) => r.operation === operation);
    const totalDuration = operationRecords.reduce((sum, r) => sum + (r.duration_ms || 0), 0);
    const successCount = operationRecords.filter((r) => r.success).length;

    stats.avgDuration = operationRecords.length > 0 ? totalDuration / operationRecords.length : 0;
    stats.successRate = operationRecords.length > 0 ? (successCount / operationRecords.length) * 100 : 0;
  });

  // Group by model
  const byModel = usageRecords.reduce(
    (acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = {
          calls: 0,
          tokens: 0,
          cost: 0,
        };
      }

      acc[record.model].calls += 1;
      acc[record.model].tokens += record.total_tokens;
      acc[record.model].cost += record.estimated_cost;

      return acc;
    },
    {} as Record<string, { calls: number; tokens: number; cost: number }>
  );

  return {
    total: {
      ...totalStats,
      averageCostPerCall: totalStats.totalCalls > 0 ? totalStats.totalCost / totalStats.totalCalls : 0,
      averageTokensPerCall: totalStats.totalCalls > 0 ? totalStats.totalTokens / totalStats.totalCalls : 0,
      averageDuration: totalStats.totalCalls > 0 ? totalStats.totalDuration / totalStats.totalCalls : 0,
      successRate: totalStats.totalCalls > 0 ? (totalStats.successfulCalls / totalStats.totalCalls) * 100 : 0,
    },
    byOperation,
    byModel,
    timeRange: {
      since: cutoffTime,
      now: Date.now(),
      durationMs: Date.now() - cutoffTime,
    },
  };
};
