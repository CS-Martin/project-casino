import { internalAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

/**
 * Fetch and sync offers from the given API endpoint
 */
export const fetchAndSyncOffers = internalAction(async (ctx) => {
  const url = 'https://xhks-nxia-vlqr.n7c.xano.io/api:1ZwRS-f0/activeSUB';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Xano API: ${res.status}`);
  const offers = await res.json();

  // Trigger the sync mutation
  await ctx.runMutation(internal.xanoAPISync.upsertOffers, { offers });
});

/**
 * Mutation that syncs the offers into Convex
 */
export const upsertOffers = internalMutation({
  args: {
    offers: v.array(
      v.object({
        casinodb_id: v.number(),
        Offer_Name: v.string(),
        offer_type: v.optional(v.string()),
        Expected_Deposit: v.optional(v.number()),
        Expected_Bonus: v.optional(v.number()),
        Name: v.string(),
        states_id: v.number(),
        state: v.object({
          Name: v.string(),
          Abbreviation: v.string(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const offer of args.offers) {
      // Upsert State
      let state = await ctx.db
        .query('states')
        .filter((q) => q.eq(q.field('abbreviation'), offer.state.Abbreviation))
        .first();

      if (!state) {
        const stateId = await ctx.db.insert('states', {
          name: offer.state.Name,
          abbreviation: offer.state.Abbreviation,
        });
        state = await ctx.db.get(stateId);
      }

      // 2️⃣ Upsert Casino
      let casino = await ctx.db
        .query('casinos')
        .filter((q) => q.and(q.eq(q.field('name'), offer.Name), q.eq(q.field('state_id'), state?._id)))
        .first();

      if (!casino) {
        const casinoId = await ctx.db.insert('casinos', {
          name: offer.Name,
          state_id: state?._id as Id<'states'>,
          is_tracked: true,
        });
        casino = await ctx.db.get(casinoId);
      }

      // 3️⃣ Upsert Offer (based on casinodb_id)
      const existingOffer = await ctx.db
        .query('offers')
        .filter((q) => q.and(q.eq(q.field('casino_id'), casino?._id), q.eq(q.field('offer_name'), offer.Offer_Name)))
        .first();

      if (existingOffer) {
        await ctx.db.patch(existingOffer._id, {
          offer_type: offer.offer_type,
          expected_deposit: offer.Expected_Deposit,
          expected_bonus: offer.Expected_Bonus,
        });
      } else {
        await ctx.db.insert('offers', {
          offer_name: offer.Offer_Name,
          offer_type: offer.offer_type,
          expected_deposit: offer.Expected_Deposit,
          expected_bonus: offer.Expected_Bonus,
          casino_id: casino?._id as Id<'casinos'>,
          updated_at: Date.now(),
          source: 'xano_api',
        });
      }
    }

    return { count: args.offers.length };
  },
});
