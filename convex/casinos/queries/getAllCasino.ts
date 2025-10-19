import { query, QueryCtx } from '../../_generated/server';

export const getAllCasinosHandler = async (ctx: QueryCtx) => {
  const casinos = await ctx.db.query('casinos').order('desc').collect();

  const results = [] as Array<
    (typeof casinos)[number] & { state?: { _id: any; name: string; abbreviation: string } | null }
  >;

  for (const casino of casinos) {
    const state = casino.state_id ? await ctx.db.get(casino.state_id) : null;
    results.push({ ...casino, state: state });
  }

  return results;
};
