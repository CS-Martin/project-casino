import { Id } from '../../_generated/dataModel';
import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const updateOfferCheckTimestampArgs = {
  casinoIds: v.array(v.id('casinos')),
  timestamp: v.optional(v.number()),
};

export const updateOfferCheckTimestampHandler = async (
  ctx: MutationCtx,
  args: { casinoIds: Id<'casinos'>[]; timestamp?: number }
) => {
  const timestamp = args.timestamp || Date.now();

  const updatePromises = args.casinoIds.map((casinoId) => ctx.db.patch(casinoId, { last_offer_check: timestamp }));

  await Promise.all(updatePromises);

  return { updated: args.casinoIds.length, timestamp };
};
