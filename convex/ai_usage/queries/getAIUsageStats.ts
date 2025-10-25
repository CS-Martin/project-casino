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

  // Group by day for timeline
  const dailyData = new Map<
    string,
    {
      date: string;
      totalCalls: number;
      successfulCalls: number;
      failedCalls: number;
      totalTokens: number;
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
      totalDuration: number;
    }
  >();

  // Calculate number of days in the range
  const durationInDays = Math.ceil((Date.now() - cutoffTime) / (24 * 60 * 60 * 1000));

  // Initialize all days with zero values
  for (let i = 0; i < durationInDays; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    dailyData.set(dateKey, {
      date: dateKey,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      totalDuration: 0,
    });
  }

  // Aggregate records by day
  usageRecords.forEach((record) => {
    const date = new Date(record._creationTime);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];

    const dayData = dailyData.get(dateKey);
    if (dayData) {
      dayData.totalCalls += 1;
      dayData.successfulCalls += record.success ? 1 : 0;
      dayData.failedCalls += record.success ? 0 : 1;
      dayData.totalTokens += record.total_tokens;
      dayData.inputTokens += record.input_tokens;
      dayData.outputTokens += record.output_tokens;
      dayData.totalCost += record.estimated_cost;
      dayData.totalDuration += record.duration_ms || 0;
    }
  });

  // Convert to array and calculate averages
  const timeline = Array.from(dailyData.values())
    .map((day) => ({
      date: day.date,
      totalCalls: day.totalCalls,
      successfulCalls: day.successfulCalls,
      failedCalls: day.failedCalls,
      totalTokens: day.totalTokens,
      inputTokens: day.inputTokens,
      outputTokens: day.outputTokens,
      totalCost: day.totalCost,
      avgDuration: day.totalCalls > 0 ? day.totalDuration / day.totalCalls : 0,
      successRate: day.totalCalls > 0 ? (day.successfulCalls / day.totalCalls) * 100 : 0,
      avgTokensPerCall: day.totalCalls > 0 ? day.totalTokens / day.totalCalls : 0,
      avgCostPerCall: day.totalCalls > 0 ? day.totalCost / day.totalCalls : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

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
    timeline,
    timeRange: {
      since: cutoffTime,
      now: Date.now(),
      durationMs: Date.now() - cutoffTime,
    },
  };
};
