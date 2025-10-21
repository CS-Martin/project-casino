import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const offers = defineTable({
  offer_name: v.string(),
  offer_type: v.optional(v.string()),
  expected_deposit: v.optional(v.number()),
  expected_bonus: v.optional(v.number()),
  description: v.optional(v.string()),
  terms: v.optional(v.string()),
  valid_until: v.optional(v.string()),
  wagering_requirement: v.optional(v.number()),
  min_deposit: v.optional(v.number()),
  max_bonus: v.optional(v.number()),
  casino_id: v.id('casinos'),
  source: v.optional(v.string()),
  is_deprecated: v.optional(v.boolean()),
  updated_at: v.optional(v.number()),
})
  .index('by_offer_name', ['offer_name'])
  .index('by_offer_type', ['offer_type'])
  .index('by_casino', ['casino_id'])
  .index('by_source', ['source'])
  .index('by_casino_source', ['casino_id', 'source'])
  .index('by_deprecated', ['is_deprecated']);
