import { Doc } from '../../_generated/dataModel';
import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinosByStateArgs = {
  stateAbbreviation: v.string(),
};

export const getCasinosByStateHandler = async (ctx: QueryCtx, args: { stateAbbreviation: string }) => {
  const state = await ctx.db
    .query('states')
    .withIndex('by_abbreviation', (q) => q.eq('abbreviation', args.stateAbbreviation))
    .first();

  if (!state) return [];

  const casinos = await ctx.db
    .query('casinos')
    .withIndex('by_state', (q) => q.eq('state_id', state._id))
    .order('desc')
    .collect();

  const results = [] as Array<(typeof casinos)[number] & { state?: Doc<'states'> }>;

  return casinos.map((casino) => ({ ...casino, state }));
};
