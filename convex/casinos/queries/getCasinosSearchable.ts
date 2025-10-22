import { Id } from '../../_generated/dataModel';
import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';

export const getCasinosSearchableArgs = {
  searchTerm: v.optional(v.string()),
  stateId: v.optional(v.id('states')),
  licenseStatus: v.optional(v.string()),
  isTracked: v.optional(v.boolean()),
  _refresh: v.optional(v.number()),
  paginationOpts: paginationOptsValidator,
};

export const getCasinosSearchableHandler = async (
  ctx: QueryCtx,
  args: {
    searchTerm?: string;
    stateId?: string;
    licenseStatus?: string;
    isTracked?: boolean;
    _refresh?: number;
    paginationOpts: { numItems: number; cursor: string | null };
  }
) => {
  // If there's a search term, we need to get ALL data first, then filter and paginate
  if (args.searchTerm) {
    // Get all casinos (we'll need to implement proper pagination later)
    const allCasinos = await ctx.db.query('casinos').order('desc').collect();

    // Enrich with state data
    const enriched = await Promise.all(
      allCasinos.map(async (casino) => {
        const state = casino.state_id ? await ctx.db.get(casino.state_id) : null;
        return { ...casino, state } as typeof casino & { state: any | null };
      })
    );

    // Apply all filters
    let filteredResults = enriched;

    // Apply search filter
    const searchLower = args.searchTerm.toLowerCase();

    filteredResults = filteredResults.filter((casino) => {
      const nameMatch = casino.name.toLowerCase().includes(searchLower);
      const websiteMatch = casino.website?.toLowerCase().includes(searchLower);
      const licenseMatch = casino.license_status?.toLowerCase().includes(searchLower);
      const stateNameMatch = casino.state?.name.toLowerCase().includes(searchLower);
      const stateAbbrMatch = casino.state?.abbreviation.toLowerCase().includes(searchLower);

      const matches = nameMatch || websiteMatch || licenseMatch || stateNameMatch || stateAbbrMatch;

      return matches;
    });

    // Apply other filters
    if (args.stateId && args.stateId !== 'all') {
      filteredResults = filteredResults.filter((casino) => casino.state_id === args.stateId);
    }

    if (args.licenseStatus && args.licenseStatus !== 'all') {
      if (args.licenseStatus === 'unknown') {
        filteredResults = filteredResults.filter((casino) => !casino.license_status);
      } else {
        filteredResults = filteredResults.filter((casino) => casino.license_status === args.licenseStatus);
      }
    }

    if (args.isTracked !== undefined) {
      filteredResults = filteredResults.filter((casino) => casino.is_tracked === args.isTracked);
    }

    // Simple pagination for search results
    const startIndex = 0;
    const endIndex = Math.min(args.paginationOpts.numItems, filteredResults.length);
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= filteredResults.length,
      continueCursor: endIndex >= filteredResults.length ? null : 'search_cursor',
    };
  }

  // Original logic for non-search queries
  let pageResult;
  let usedIndex = '';

  if (args.stateId && args.stateId !== 'all') {
    pageResult = await ctx.db
      .query('casinos')
      .withIndex('by_state', (q) => q.eq('state_id', args.stateId as Id<'states'>))
      .order('desc')
      .paginate(args.paginationOpts);
    usedIndex = 'state';
  } else if (args.licenseStatus && args.licenseStatus !== 'all') {
    if (args.licenseStatus === 'unknown') {
      pageResult = await ctx.db.query('casinos').order('desc').paginate(args.paginationOpts);
      usedIndex = 'license';
    } else {
      pageResult = await ctx.db
        .query('casinos')
        .withIndex('by_license_status', (q) => q.eq('license_status', args.licenseStatus))
        .order('desc')
        .paginate(args.paginationOpts);
      usedIndex = 'license';
    }
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

  // Apply license status filter if not used as index, or if "unknown" was used as index
  if (
    args.licenseStatus &&
    args.licenseStatus !== 'all' &&
    (usedIndex !== 'license' || args.licenseStatus === 'unknown')
  ) {
    if (args.licenseStatus === 'unknown') {
      filteredResults = filteredResults.filter((casino) => !casino.license_status);
    } else {
      filteredResults = filteredResults.filter((casino) => casino.license_status === args.licenseStatus);
    }
  }

  // Apply tracked status filter if not used as index
  if (args.isTracked !== undefined && usedIndex !== 'tracked') {
    filteredResults = filteredResults.filter((casino) => casino.is_tracked === args.isTracked);
  }

  // Apply state filter if not used as index
  if (args.stateId && args.stateId !== 'all' && usedIndex !== 'state') {
    filteredResults = filteredResults.filter((casino) => casino.state_id === args.stateId);
  }

  return {
    page: filteredResults,
    isDone: pageResult.isDone,
    continueCursor: pageResult.continueCursor,
  };
};
