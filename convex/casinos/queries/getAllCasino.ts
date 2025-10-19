import { query, QueryCtx } from '../../_generated/server';

export const getAllCasinoHandler = async (ctx: QueryCtx) => {
  return await ctx.db.query('casinos').order('desc').collect();
};
