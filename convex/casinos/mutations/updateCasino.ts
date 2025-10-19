import { Id } from '../../_generated/dataModel';
import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const updateCasinoArgs = {
  id: v.id('casinos'),
  name: v.optional(v.string()),
  website: v.optional(v.string()),
  license_status: v.optional(v.string()),
  source_url: v.optional(v.string()),
  is_tracked: v.optional(v.boolean()),
};

export const updateCasinoHandler = async (
  ctx: MutationCtx,
  args: {
    id: Id<'casinos'>;
    name?: string;
    website?: string;
    license_status?: string;
    source_url?: string;
    is_tracked?: boolean;
  }
) => {
  const { id, ...updates } = args;
  return await ctx.db.patch(id, updates);
};
