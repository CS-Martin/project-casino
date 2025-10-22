import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const casino_discovery_logs = defineTable({
  timestamp: v.number(),
  casinos_discovered: v.number(),
  casinos_saved: v.number(),
  casinos_skipped: v.number(),
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
  triggered_by: v.string(), // 'cron' or 'manual'
})
  .index('by_timestamp', ['timestamp'])
  .index('by_triggered_by', ['triggered_by'])
  .index('by_success', ['success']);
