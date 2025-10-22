import { v } from 'convex/values';
import { mutation, MutationCtx } from '../../_generated/server';

export const createDiscoveryLogArgs = {
  timestamp: v.number(),
  casinos_discovered: v.number(),
  casinos_saved: v.number(),
  casinos_skipped: v.number(),
  saved_casinos: v.optional(
    v.array(
      v.object({
        name: v.string(),
        state: v.string(),
        website: v.optional(v.string()),
      })
    )
  ),
  duplicates: v.optional(
    v.array(
      v.object({
        discovered: v.string(),
        existing: v.string(),
        reason: v.string(),
        score: v.optional(v.number()),
      })
    )
  ),
  states_searched: v.optional(v.array(v.string())),
  duration_ms: v.number(),
  success: v.boolean(),
  error: v.optional(v.string()),
  triggered_by: v.string(),
};

export const createDiscoveryLogHandler = async (
  ctx: MutationCtx,
  args: {
    timestamp: number;
    casinos_discovered: number;
    casinos_saved: number;
    casinos_skipped: number;
    saved_casinos?: Array<{
      name: string;
      state: string;
      website?: string;
    }>;
    duplicates?: Array<{
      discovered: string;
      existing: string;
      reason: string;
      score?: number;
    }>;
    states_searched?: string[];
    duration_ms: number;
    success: boolean;
    error?: string;
    triggered_by: string;
  }
) => {
  const logId = await ctx.db.insert('casino_discovery_logs', {
    timestamp: args.timestamp,
    casinos_discovered: args.casinos_discovered,
    casinos_saved: args.casinos_saved,
    casinos_skipped: args.casinos_skipped,
    saved_casinos: args.saved_casinos,
    duplicates: args.duplicates,
    states_searched: args.states_searched,
    duration_ms: args.duration_ms,
    success: args.success,
    error: args.error,
    triggered_by: args.triggered_by,
  });

  return logId;
};
