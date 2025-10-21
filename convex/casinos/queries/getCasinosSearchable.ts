import { Id } from '../../_generated/dataModel';
import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCasinosSearchableArgs = {
  searchTerm: v.optional(v.string()),
  stateId: v.optional(v.id('states')),
  licenseStatus: v.optional(v.string()),
  isTracked: v.optional(v.boolean()),
  paginationOpts: v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
    id: v.optional(v.number()),
  }),
};

export const getCasinosSearchableHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm?: string;
    stateId?: string;
    licenseStatus?: string;
    isTracked?: boolean;
    paginationOpts: { numItems: number; cursor: string | null };
  }
) => {
  // Apply indexed filters and get paginated results
  let pageResult;
  let usedIndex = '';

  if (args.stateId) {
    pageResult = await ctx.db
      .query('casinos')
      .withIndex('by_state', (q) => q.eq('state_id', args.stateId as Id<'states'>))
      .order('desc')
      .paginate(args.paginationOpts);
    usedIndex = 'state';
  } else if (args.licenseStatus) {
    pageResult = await ctx.db
      .query('casinos')
      .withIndex('by_license_status', (q) => q.eq('license_status', args.licenseStatus))
      .order('desc')
      .paginate(args.paginationOpts);
    usedIndex = 'license';
  } else if (args.isTracked !== undefined) {
    pageResult = await ctx.db
      .query('casinos')
      .withIndex('tracked_casinos', (q) => q.eq('is_tracked', args.isTracked as boolean))
      .order('desc')
      .paginate(args.paginationOpts);
    usedIndex = 'tracked';
  } else {
    pageResult = await ctx.db.query('casinos').order('desc').paginate(args.paginationOpts);
  }

  // Enrich with state data
  const enriched = await Promise.all(
    pageResult.page.map(async (casino) => {
      const state = casino.state_id ? await ctx.db.get(casino.state_id) : null;
      return { ...casino, state } as typeof casino & { state: any | null };
    })
  );

  // Apply additional filters that weren't used as indexes
  let filteredResults = enriched;

  // Apply search filter if provided
  if (args.searchTerm) {
    const searchLower = args.searchTerm.toLowerCase();
    filteredResults = filteredResults.filter((casino) => {
      return (
        casino.name.toLowerCase().includes(searchLower) ||
        casino.website?.toLowerCase().includes(searchLower) ||
        casino.license_status?.toLowerCase().includes(searchLower) ||
        casino.state?.name.toLowerCase().includes(searchLower) ||
        casino.state?.abbreviation.toLowerCase().includes(searchLower)
      );
    });
  }

  // Apply license status filter if not used as index
  if (args.licenseStatus && usedIndex !== 'license') {
    filteredResults = filteredResults.filter((casino) => casino.license_status === args.licenseStatus);
  }

  // Apply tracked status filter if not used as index
  if (args.isTracked !== undefined && usedIndex !== 'tracked') {
    filteredResults = filteredResults.filter((casino) => casino.is_tracked === args.isTracked);
  }

  // Apply state filter if not used as index
  if (args.stateId && usedIndex !== 'state') {
    filteredResults = filteredResults.filter((casino) => casino.state_id === args.stateId);
  }

  return {
    page: filteredResults,
    isDone: pageResult.isDone,
    continueCursor: pageResult.continueCursor,
  };
};
