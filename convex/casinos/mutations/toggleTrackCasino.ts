import { Id } from '../../_generated/dataModel';
import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const toggleTrackCasinoArgs = {
  casinoId: v.id('casinos'),
  isTracked: v.boolean(),
};

export const toggleTrackCasinoHandler = async (
  ctx: MutationCtx,
  args: {
    casinoId: Id<'casinos'>;
    isTracked: boolean;
  }
) => {
  // Get the casino to ensure it exists
  const casino = await ctx.db.get(args.casinoId);
  if (!casino) {
    throw new Error('Casino not found');
  }

  // Update the casino's tracked status
  await ctx.db.patch(args.casinoId, {
    is_tracked: args.isTracked,
  });

  return { success: true, casinoId: args.casinoId, isTracked: args.isTracked };
};
