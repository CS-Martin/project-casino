import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';

export const getOrCreateStateArgs = {
  name: v.string(),
  abbreviation: v.string(),
};

export const getOrCreateStateHandler = async (ctx: MutationCtx, args: { name: string; abbreviation: string }) => {
  // First, try to find existing state by abbreviation
  const existingState = await ctx.db
    .query('states')
    .withIndex('by_abbreviation', (q) => q.eq('abbreviation', args.abbreviation))
    .first();

  if (existingState) {
    return existingState._id;
  }

  // If not found, create new state
  const stateId = await ctx.db.insert('states', {
    name: args.name,
    abbreviation: args.abbreviation,
  });

  return stateId;
};
