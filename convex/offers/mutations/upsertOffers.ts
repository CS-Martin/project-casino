import { Doc, Id } from '../../_generated/dataModel';
import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const upsertOffersArgs = {
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

export const upsertOffersHandler = async (
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

  // Get existing offers for this casino from the same source
  const existingOffers = await ctx.db
    .query('offers')
    .withIndex('by_casino_source', (q) => q.eq('casino_id', args.casinoId).eq('source', source))
    .collect();

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
  };

  for (const newOffer of args.offers) {
    // Find matching existing offer using fuzzy matching
    const matchingOffer = findMatchingOffer(existingOffers, newOffer);

    if (matchingOffer) {
      // Check if the offer has meaningful changes
      const hasChanges = hasSignificantChanges(matchingOffer, newOffer);

      if (hasChanges) {
        await ctx.db.patch(matchingOffer._id, {
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
          updated_at: timestamp,
        });
        results.updated++;
      } else {
        results.skipped++;
      }
    } else {
      // Create new offer
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
  }

  // Mark offers that are no longer present as deprecated
  const newOfferNames = args.offers.map((o) => o.offer_name.toLowerCase().trim());
  for (const existingOffer of existingOffers) {
    const existingName = existingOffer.offer_name.toLowerCase().trim();
    if (!newOfferNames.includes(existingName) && !existingOffer.is_deprecated) {
      await ctx.db.patch(existingOffer._id, {
        is_deprecated: true,
        updated_at: timestamp,
      });
    }
  }

  return results;
};

// Helper function to find matching offers using fuzzy matching
function findMatchingOffer(
  existingOffers: Doc<'offers'>[],
  newOffer: {
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
  }
): Doc<'offers'> | null {
  const newName = newOffer.offer_name.toLowerCase().trim();
  const newType = newOffer.offer_type;
  const newBonus = newOffer.expected_bonus;
  const newDeposit = newOffer.expected_deposit;

  for (const existing of existingOffers) {
    const existingName = existing.offer_name.toLowerCase().trim();
    const existingType = existing.offer_type;
    const existingBonus = existing.expected_bonus;
    const existingDeposit = existing.expected_deposit;

    // Check for exact name match
    if (existingName === newName) {
      return existing;
    }

    // Check for similar name and same type
    if (newType && existingType === newType) {
      const nameSimilarity = calculateSimilarity(existingName, newName);
      if (nameSimilarity > 0.8) {
        return existing;
      }
    }

    // Check for same bonus amount and type (for cases where names might vary)
    if (newType && existingType === newType && newBonus && existingBonus && Math.abs(newBonus - existingBonus) < 0.01) {
      const nameSimilarity = calculateSimilarity(existingName, newName);
      if (nameSimilarity > 0.6) {
        return existing;
      }
    }
  }

  return null;
}

// Simple similarity calculation using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
    }
  }

  return matrix[str2.length][str1.length];
}

// Helper function to check if offer has significant changes
function hasSignificantChanges(
  existing: Doc<'offers'>,
  newOffer: {
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
  }
): boolean {
  // Check if bonus amount changed significantly (more than 1% or $1)
  if (existing.expected_bonus && newOffer.expected_bonus) {
    const bonusDiff = Math.abs(existing.expected_bonus - newOffer.expected_bonus);
    const bonusPercentDiff = bonusDiff / existing.expected_bonus;
    if (bonusPercentDiff > 0.01 || bonusDiff > 1) {
      return true;
    }
  }

  // Check if deposit amount changed significantly
  if (existing.expected_deposit && newOffer.expected_deposit) {
    const depositDiff = Math.abs(existing.expected_deposit - newOffer.expected_deposit);
    const depositPercentDiff = depositDiff / existing.expected_deposit;
    if (depositPercentDiff > 0.01 || depositDiff > 1) {
      return true;
    }
  }

  // Check if offer type changed
  if (existing.offer_type !== newOffer.offer_type) {
    return true;
  }

  // Check if name changed significantly
  const nameSimilarity = calculateSimilarity(
    existing.offer_name.toLowerCase().trim(),
    newOffer.offer_name.toLowerCase().trim()
  );
  if (nameSimilarity < 0.9) {
    return true;
  }

  return false;
}

export const upsertOffers = mutation({
  args: {
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
  },
  handler: upsertOffersHandler,
});
