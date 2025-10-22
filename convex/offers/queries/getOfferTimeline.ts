import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getOfferTimelineArgs = {
  timeRange: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'))),
} as const;

export interface OfferTimelineDataPoint {
  date: string;
  newOffers: number;
  expiredOffers: number;
  offersCreated: number; // From research logs
  offersUpdated: number; // From research logs
  offersSkipped: number; // From research logs
  casinosResearched: number; // From research logs
  researchRuns: number; // Number of research runs that day
  successfulRuns: number; // Number of successful research runs
  avgDuration: number; // Average duration in ms
}

export const getOfferTimelineHandler = async (
  ctx: QueryCtx,
  args: { timeRange?: '7d' | '30d' | '90d' }
): Promise<OfferTimelineDataPoint[]> => {
  const timeRange = args.timeRange || '90d';
  const now = Date.now();

  // Calculate start date based on time range
  let daysToSubtract = 90;
  if (timeRange === '30d') {
    daysToSubtract = 30;
  } else if (timeRange === '7d') {
    daysToSubtract = 7;
  }

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToSubtract);
  startDate.setHours(0, 0, 0, 0);
  const startTimestamp = startDate.getTime();

  // Get all offers
  const allOffers = await ctx.db.query('offers').collect();

  // Get all research logs in the time range
  const researchLogs = await ctx.db
    .query('offer_research_logs')
    .withIndex('by_timestamp')
    .filter((q) => q.gte(q.field('timestamp'), startTimestamp))
    .collect();

  // Create a map to store counts by date
  const dateMap = new Map<
    string,
    {
      newOffers: number;
      expiredOffers: number;
      offersCreated: number;
      offersUpdated: number;
      offersSkipped: number;
      casinosResearched: number;
      researchRuns: number;
      successfulRuns: number;
      totalDuration: number;
    }
  >();

  // Initialize all dates in the range
  for (let i = 0; i <= daysToSubtract; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, {
      newOffers: 0,
      expiredOffers: 0,
      offersCreated: 0,
      offersUpdated: 0,
      offersSkipped: 0,
      casinosResearched: 0,
      researchRuns: 0,
      successfulRuns: 0,
      totalDuration: 0,
    });
  }

  // Count new offers by creation date
  allOffers.forEach((offer) => {
    if (offer._creationTime >= startTimestamp) {
      const creationDate = new Date(offer._creationTime);
      const dateStr = creationDate.toISOString().split('T')[0];
      const entry = dateMap.get(dateStr);
      if (entry) {
        entry.newOffers += 1;
      }
    }
  });

  // Count expired/deprecated offers
  allOffers.forEach((offer) => {
    // Check if offer was deprecated in the time range
    if (offer.is_deprecated && offer.updated_at && offer.updated_at >= startTimestamp) {
      const deprecatedDate = new Date(offer.updated_at);
      const dateStr = deprecatedDate.toISOString().split('T')[0];
      const entry = dateMap.get(dateStr);
      if (entry) {
        entry.expiredOffers += 1;
      }
    }

    // Check if offer expired in the time range
    if (offer.valid_until) {
      const expirationDate = new Date(offer.valid_until);
      const expirationTimestamp = expirationDate.getTime();

      if (
        expirationTimestamp >= startTimestamp &&
        expirationTimestamp <= now &&
        !offer.is_deprecated // Only count if not already counted as deprecated
      ) {
        const dateStr = expirationDate.toISOString().split('T')[0];
        const entry = dateMap.get(dateStr);
        if (entry) {
          entry.expiredOffers += 1;
        }
      }
    }
  });

  // Process research logs
  researchLogs.forEach((log) => {
    const logDate = new Date(log.timestamp);
    const dateStr = logDate.toISOString().split('T')[0];
    const entry = dateMap.get(dateStr);
    if (entry) {
      entry.offersCreated += log.offers_created || 0;
      entry.offersUpdated += log.offers_updated || 0;
      entry.offersSkipped += log.offers_skipped || 0;
      entry.casinosResearched += log.casinos_researched || 0;
      entry.researchRuns += 1;
      if (log.success) {
        entry.successfulRuns += 1;
      }
      entry.totalDuration += log.duration_ms || 0;
    }
  });

  // Convert map to array and sort by date
  const timeline: OfferTimelineDataPoint[] = Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      newOffers: counts.newOffers,
      expiredOffers: counts.expiredOffers,
      offersCreated: counts.offersCreated,
      offersUpdated: counts.offersUpdated,
      offersSkipped: counts.offersSkipped,
      casinosResearched: counts.casinosResearched,
      researchRuns: counts.researchRuns,
      successfulRuns: counts.successfulRuns,
      avgDuration: counts.researchRuns > 0 ? Math.round(counts.totalDuration / counts.researchRuns) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return timeline;
};
