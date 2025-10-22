import { mutation } from '../../_generated/server';
import { v } from 'convex/values';

export const createResearchLogArgs = {
  casinos_researched: v.number(),
  offers_created: v.number(),
  offers_updated: v.number(),
  offers_skipped: v.number(),
  casinos: v.array(
    v.object({
      id: v.id('casinos'),
      name: v.string(),
      state: v.optional(v.string()),
    })
  ),
  offer_details: v.optional(
    v.array(
      v.object({
        casino_name: v.string(),
        offer_name: v.string(),
        action: v.string(),
        reason: v.optional(v.string()),
        offer_type: v.optional(v.string()),
        expected_bonus: v.optional(v.number()),
      })
    )
  ),
  duration_ms: v.number(),
  success: v.boolean(),
  errors: v.optional(v.array(v.string())),
  triggered_by: v.string(),
  batch_size: v.optional(v.number()),
};

export const createResearchLogHandler = async (
  ctx: any,
  args: {
    casinos_researched: number;
    offers_created: number;
    offers_updated: number;
    offers_skipped: number;
    casinos: Array<{ id: any; name: string; state?: string }>;
    offer_details?: Array<{
      casino_name: string;
      offer_name: string;
      action: string;
      reason?: string;
      offer_type?: string;
      expected_bonus?: number;
    }>;
    duration_ms: number;
    success: boolean;
    errors?: string[];
    triggered_by: string;
    batch_size?: number;
  }
) => {
  const logId = await ctx.db.insert('offer_research_logs', {
    timestamp: Date.now(),
    casinos_researched: args.casinos_researched,
    offers_created: args.offers_created,
    offers_updated: args.offers_updated,
    offers_skipped: args.offers_skipped,
    casinos: args.casinos,
    offer_details: args.offer_details,
    duration_ms: args.duration_ms,
    success: args.success,
    errors: args.errors,
    triggered_by: args.triggered_by,
    batch_size: args.batch_size,
  });

  return logId;
};
