import { QueryCtx } from '../../_generated/server';

export const getCasinoStatsHandler = async (ctx: QueryCtx) => {
  const casinos = await ctx.db.query('casinos').collect();

  const total = casinos.length;
  const tracked = casinos.filter((casino) => casino.is_tracked).length;
  const untracked = total - tracked;
  const coverageGapPercentage = total > 0 ? Math.round((untracked / total) * 100) : 0;

  return {
    total,
    tracked,
    untracked,
    coverageGapPercentage,
  };
};
