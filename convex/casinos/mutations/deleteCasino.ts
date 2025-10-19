import { Id } from '../../_generated/dataModel';
import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const deleteCasinoArgs = {
  id: v.id('casinos'),
};

export const deleteCasinoHandler = async (ctx: MutationCtx, args: { id: Id<'casinos'> }) => {
  return await ctx.db.delete(args.id);
};
