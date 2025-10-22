import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const offer_research_logs = defineTable({
  // When the research happened
  timestamp: v.number(),

  // Research metrics
  casinos_researched: v.number(), // Number of casinos processed
  offers_created: v.number(), // New offers found
  offers_updated: v.number(), // Existing offers updated
  offers_skipped: v.number(), // Skipped (duplicates or not better)

  // Casinos involved in this research
  casinos: v.array(
    v.object({
      id: v.id('casinos'),
      name: v.string(),
      state: v.optional(v.string()), // State abbreviation
    })
  ),

  // Detailed offer activity logs
  offer_details: v.optional(
    v.array(
      v.object({
        casino_name: v.string(),
        offer_name: v.string(),
        action: v.string(), // 'created', 'updated', 'skipped', 'expired'
        reason: v.optional(v.string()), // Why it was skipped
        offer_type: v.optional(v.string()),
        expected_bonus: v.optional(v.number()),
      })
    )
  ),

  // Performance
  duration_ms: v.number(), // How long it took in milliseconds

  // Status
  success: v.boolean(),
  errors: v.optional(v.array(v.string())), // Any errors encountered

  // Metadata
  triggered_by: v.string(), // 'manual', 'cron', 'api'
  batch_size: v.optional(v.number()), // Requested batch size
})
  .index('by_timestamp', ['timestamp'])
  .index('by_triggered_by', ['triggered_by'])
  .index('by_success', ['success']);
