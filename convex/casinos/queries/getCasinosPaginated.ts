import { QueryCtx } from '../../_generated/server';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

export const getCasinosPaginatedArgs = {
  paginationOpts: paginationOptsValidator,
};

export const getCasinosPaginatedHandler = async (
  ctx: QueryCtx,
  args: { paginationOpts: { numItems: number; cursor: string | null } }
) => {
  const pageResult = await ctx.db.query('casinos').order('desc').paginate(args.paginationOpts);

  const enriched = await Promise.all(
    pageResult.page.map(async (casino) => {
      const state = casino.state_id ? await ctx.db.get(casino.state_id) : null;
      return { ...casino, state } as typeof casino & { state: any | null };
    })
  );

  return {
    page: enriched,
    isDone: pageResult.isDone,
    continueCursor: pageResult.continueCursor,
  };
};
