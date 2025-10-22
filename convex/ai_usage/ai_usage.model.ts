import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * AI Usage tracking table
 * Stores token usage and cost information for all AI operations
 */
export const ai_usage = defineTable({
  // Operation details
  model: v.string(), // e.g., "gpt-4o-mini"
  operation: v.string(), // e.g., "casino-discovery", "offer-research"

  // Token usage
  input_tokens: v.number(),
  output_tokens: v.number(),
  total_tokens: v.number(),

  // Cost tracking
  estimated_cost: v.number(), // in USD

  // Metadata
  duration_ms: v.optional(v.number()), // How long the AI call took
  success: v.boolean(), // Whether the call succeeded
  error_message: v.optional(v.string()),

  // Context (for debugging/analytics)
  context: v.optional(
    v.object({
      casinoId: v.optional(v.string()),
      casinoName: v.optional(v.string()),
      statesCount: v.optional(v.number()),
      offersCount: v.optional(v.number()),
      batchSize: v.optional(v.number()),
    })
  ),
})
  .index('by_operation', ['operation'])
  .index('by_model', ['model']);
