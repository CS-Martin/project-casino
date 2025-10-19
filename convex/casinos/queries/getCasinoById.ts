import { Id } from '../../_generated/dataModel';
import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinoByIdArgs = {
  id: v.id('casinos'),
};

export const getCasinoByIdHandler = async (
  ctx: QueryCtx,
  args: {
    id: Id<'casinos'>;
  }
) => {
  return await ctx.db.get(args.id);
};
