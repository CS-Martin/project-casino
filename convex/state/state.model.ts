import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const state = defineTable({
  name: v.string(),
  abbreviation: v.string(),
})
  .index('by_name', ['name'])
  .index('by_abbreviation', ['abbreviation']);
