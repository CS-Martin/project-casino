import { query, QueryCtx } from '../../_generated/server';

export const getAllStatesHandler = async (ctx: QueryCtx) => {
  const states = await ctx.db.query('states').order('asc').collect();
  return states;
};
