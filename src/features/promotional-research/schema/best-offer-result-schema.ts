import z from 'zod';

// Schema for the best offer determination result
export const BestOfferResultSchema = z.object({
  bestOfferId: z.string().describe('The ID of the best offer'),
  reasoning: z.string().describe('Detailed reasoning for why this is the best offer'),
  score: z.number().min(0).max(100).describe('Overall score out of 100 for the best offer'),
  strengths: z.array(z.string()).describe('List of strengths of this offer'),
  considerations: z.array(z.string()).describe('Things to consider or potential drawbacks'),
  rankingFactors: z
    .object({
      valueScore: z.number().min(0).max(10).describe('Value for money score'),
      bonusAmount: z.number().min(0).max(10).describe('Bonus amount score'),
      wageringRequirement: z.number().min(0).max(10).describe('Wagering requirement favorability'),
      easeOfUse: z.number().min(0).max(10).describe('How easy it is to claim and use'),
    })
    .describe('Individual ranking factors that contributed to the decision'),
});

export type BestOfferResult = z.infer<typeof BestOfferResultSchema>;
