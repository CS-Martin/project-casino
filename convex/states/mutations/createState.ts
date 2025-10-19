import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';

export const createStateArgs = {
  name: v.string(),
  abbreviation: v.string(),
};

export const createStateHandler = async (ctx: MutationCtx, args: { name: string; abbreviation: string }) => {
  const stateId = await ctx.db.insert('states', {
    name: args.name,
    abbreviation: args.abbreviation,
  });

  return stateId;
};
