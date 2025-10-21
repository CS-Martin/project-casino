import { z } from 'zod';

export const OfferSchema = z.object({
  offer_name: z.string(),
  offer_type: z.enum([
    'deposit_bonus',
    'free_spins',
    'lossback',
    'welcome_package',
    'reload_bonus',
    'cashback',
    'tournament',
    'other',
  ]),
  expected_deposit: z.number(),
  expected_bonus: z.number(),
  description: z.string(),
  terms: z.string(),
  valid_until: z.string(),
  wagering_requirement: z.number(),
  min_deposit: z.number(),
  max_bonus: z.number(),
});

export const CasinoOfferResearchSchema = z.object({
  casino_name: z.string(),
  casino_website: z.string(),
  offers: z.array(OfferSchema),
  research_notes: z.string(),
  last_updated: z.string(),
});

export const OfferResearchSchema = z.object({
  researchResults: z.array(CasinoOfferResearchSchema),
});

export type Offer = z.infer<typeof OfferSchema>;
export type CasinoOfferResearch = z.infer<typeof CasinoOfferResearchSchema>;
export type OfferResearch = z.infer<typeof OfferResearchSchema>;
