import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const offer = defineTable({
  offer_name: v.string(),
  offer_type: v.optional(v.string()),
  expected_deposit: v.optional(v.number()),
  expected_bonus: v.optional(v.number()),
  casino_id: v.id('casino'),
})
  .index('by_offer_name', ['offer_name'])
  .index('by_offer_type', ['offer_type'])
  .index('by_casino', ['casino_id']);
