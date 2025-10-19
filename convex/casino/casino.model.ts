import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const casino = defineTable({
  name: v.string(),
  website: v.optional(v.string()),
  license_status: v.optional(v.string()),
  source_url: v.optional(v.string()),
  state_id: v.id('state'),
})
  .index('by_name', ['name'])
  .index('by_state', ['state_id'])
  .index('by_license_status', ['license_status']);
