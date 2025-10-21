import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { OFFER_RESEARCH_SYSTEM_PROMPT, createOfferResearchUserPrompt } from '../lib/constants';
import { OfferResearchSchema, CasinoOfferResearch } from '../schema/offer-research.schema';
import { logger } from '../lib/logger';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CasinoForResearch {
  id: string;
  name: string;
  website?: string;
}

export interface OfferResearchResult {
  success: boolean;
  data?: CasinoOfferResearch[];
  error?: string;
  timestamp: number;
}

export async function researchCasinoOffers(casinos: CasinoForResearch[]): Promise<OfferResearchResult> {
  logger.info('Starting promotional offer research', {
    casinoCount: casinos.length,
    casinoNames: casinos.map((c) => c.name),
  });

  try {
    const startTime = Date.now();

    const response = await client.responses.parse({
      model: 'gpt-4o-mini',
      tools: [{ type: 'web_search' }],
      input: [
        {
          role: 'system',
          content: OFFER_RESEARCH_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: createOfferResearchUserPrompt(casinos),
        },
      ],
      text: {
        format: zodTextFormat(OfferResearchSchema, 'researchResults'),
      },
    });

    const duration = Date.now() - startTime;

    if (!response.output_parsed) {
      logger.error('No offer research results generated from OpenAI response', {
        duration,
        casinoCount: casinos.length,
      });
      throw new Error('No offer research results generated');
    }

    const resultCount = response.output_parsed.researchResults.length;
    logger.info('Offer research completed successfully', {
      duration,
      casinoCount: casinos.length,
      resultCount,
      resultsPerCasino: resultCount / casinos.length,
    });

    return {
      success: true,
      data: response.output_parsed.researchResults,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    logger.error(
      'AI offer research failed',
      {
        casinoCount: casinos.length,
        casinoNames: casinos.map((c) => c.name),
      },
      error
    );

    return {
      success: false,
      error: error.message || 'Unknown error occurred during offer research',
      timestamp: Date.now(),
    };
  }
}
