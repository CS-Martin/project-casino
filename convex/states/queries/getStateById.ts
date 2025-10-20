import { v } from 'convex/values';
import { QueryCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const getStateByIdArgs = { stateId: v.id('states') };

export const getStateByIdHandler = async (ctx: QueryCtx, args: { stateId: Id<'states'> }) => {
  const state = await ctx.db.get(args.stateId);
  return state;
};
