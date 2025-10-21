import { Doc, Id } from '../../_generated/dataModel';
import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const createOffersArgs = {
  casinoId: v.id('casinos'),
  offers: v.array(
    v.object({
      offer_name: v.string(),
      offer_type: v.optional(v.string()),
      expected_deposit: v.optional(v.number()),
      expected_bonus: v.optional(v.number()),
      description: v.optional(v.string()),
      terms: v.optional(v.string()),
      valid_until: v.optional(v.string()),
      wagering_requirement: v.optional(v.number()),
      min_deposit: v.optional(v.number()),
      max_bonus: v.optional(v.number()),
    })
  ),
  source: v.optional(v.string()),
};

export const createOffersHandler = async (
  ctx: MutationCtx,
  args: {
    casinoId: Id<'casinos'>;
    offers: {
      offer_name: string;
      offer_type?: string | undefined;
      expected_deposit?: number | undefined;
      expected_bonus?: number | undefined;
      description?: string | undefined;
      terms?: string | undefined;
      valid_until?: string | undefined;
      wagering_requirement?: number | undefined;
      min_deposit?: number | undefined;
      max_bonus?: number | undefined;
    }[];
    source?: string | undefined;
  }
) => {
  const timestamp = Date.now();
  const source = args.source || 'ai_research';

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
  };

  // Always create new offers - no upserting to preserve historical data
  for (const newOffer of args.offers) {
    await ctx.db.insert('offers', {
      offer_name: newOffer.offer_name,
      offer_type: newOffer.offer_type,
      expected_deposit: newOffer.expected_deposit,
      expected_bonus: newOffer.expected_bonus,
      description: newOffer.description,
      terms: newOffer.terms,
      valid_until: newOffer.valid_until,
      wagering_requirement: newOffer.wagering_requirement,
      min_deposit: newOffer.min_deposit,
      max_bonus: newOffer.max_bonus,
      casino_id: args.casinoId,
      source,
      is_deprecated: false,
      updated_at: timestamp,
    });
    results.created++;
  }

  return results;
};

export const createOffers = mutation({
  args: createOffersArgs,
  handler: createOffersHandler,
});
