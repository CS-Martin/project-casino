import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const casinos = defineTable({
  name: v.string(),
  website: v.optional(v.string()),
  license_status: v.optional(v.string()),
  source_url: v.optional(v.string()),
  state_id: v.id('states'),
  is_tracked: v.boolean(),
  last_offer_check: v.optional(v.number()),
})
  .index('by_name', ['name'])
  .index('by_state', ['state_id'])
  .index('by_license_status', ['license_status'])
  .index('tracked_casinos', ['is_tracked'])
  .index('by_offer_check', ['last_offer_check'])
  .index('tracked_by_offer_check', ['is_tracked', 'last_offer_check']);
