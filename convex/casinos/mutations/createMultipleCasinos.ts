import { v } from 'convex/values';
import { mutation, MutationCtx } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';

export const createMultipleCasinosArgs = {
  casinos: v.array(
    v.object({
      name: v.string(),
      website: v.optional(v.string()),
      license_status: v.optional(v.string()),
      source_url: v.optional(v.string()),
      state_id: v.id('states'),
      is_tracked: v.boolean(),
    })
  ),
};

export const createMultipleCasinosHandler = async (
  ctx: MutationCtx,
  args: {
    casinos: Array<{
      name: string;
      website?: string;
      license_status?: string;
      source_url?: string;
      state_id: Id<'states'>;
      is_tracked: boolean;
    }>;
  }
) => {
  const results = [];

  for (const casino of args.casinos) {
    const id = await ctx.db.insert('casinos', casino);
    results.push({ id, ...casino });
  }

  return results;
};
