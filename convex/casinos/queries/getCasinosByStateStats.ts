import { QueryCtx } from '../../_generated/server';

export const getCasinosByStateStatsHandler = async (ctx: QueryCtx) => {
  const casinos = await ctx.db.query('casinos').collect();

  // Group casinos by state
  const stateMap = new Map<
    string,
    { tracked: number; untracked: number; total: number; stateName: string; stateAbbr: string }
  >();

  for (const casino of casinos) {
    const state = casino.state_id ? await ctx.db.get(casino.state_id) : null;
    if (!state) continue;

    const stateKey = state.abbreviation;

    if (!stateMap.has(stateKey)) {
      stateMap.set(stateKey, {
        tracked: 0,
        untracked: 0,
        total: 0,
        stateName: state.name,
        stateAbbr: state.abbreviation,
      });
    }

    const stateData = stateMap.get(stateKey)!;
    stateData.total++;

    if (casino.is_tracked) {
      stateData.tracked++;
    } else {
      stateData.untracked++;
    }
  }

  // Convert to array and sort by total descending
  return Array.from(stateMap.values())
    .map((state) => ({
      state: `${state.stateName} (${state.stateAbbr})`,
      tracked: state.tracked,
      untracked: state.untracked,
      total: state.total,
    }))
    .sort((a, b) => b.total - a.total);
};
