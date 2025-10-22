import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { OFFER_RESEARCH_SYSTEM_PROMPT, createOfferResearchUserPrompt } from '../lib/constants';
import { OfferResearchSchema, CasinoOfferResearch } from '../schema/offer-research.schema';
import { logger } from '@/lib/logger';
import { aiUsageTracker } from '@/lib/ai-cost-tracker';

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
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export async function researchCasinoOffers(casinos: CasinoForResearch[]): Promise<OfferResearchResult> {
  const startTime = Date.now();

  try {
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

    // Debug: Log the response structure

    if (!response.output_parsed) {
      // Track failed AI call
      await aiUsageTracker.trackFromResponse(response, {
        model: 'gpt-4o-mini',
        operation: 'offer-research',
        durationMs: duration,
        context: {
          batchSize: casinos.length,
        },
      });

      logger.error('No offer research results generated from OpenAI response', undefined, {
        function: 'researchCasinoOffers',
        duration,
        casinoCount: casinos.length,
      });
      throw new Error('No offer research results generated');
    }

    // Track successful AI call
    const usageResult = await aiUsageTracker.trackFromResponse(response, {
      model: 'gpt-4o-mini',
      operation: 'offer-research',
      durationMs: duration,
      context: {
        batchSize: casinos.length,
        offersCount: response.output_parsed.researchResults?.length || 0,
      },
    });

    return {
      success: true,
      data: response.output_parsed.researchResults,
      timestamp: Date.now(),
      usage: usageResult
        ? {
            inputTokens: usageResult.inputTokens,
            outputTokens: usageResult.outputTokens,
            totalTokens: usageResult.totalTokens,
            estimatedCost: usageResult.estimatedCost,
          }
        : undefined,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track failed AI call with error
    try {
      await aiUsageTracker.track({
        model: 'gpt-4o-mini',
        operation: 'offer-research',
        inputTokens: 0,
        outputTokens: 0,
        durationMs: duration,
        success: false,
        error: error.message,
        context: {
          batchSize: casinos.length,
        },
      });
    } catch (trackError) {
      // Ignore tracking errors
    }

    logger.error('AI offer research failed', error, {
      function: 'researchCasinoOffers',
      duration,
      casinoCount: casinos.length,
      casinoNames: casinos.map((c) => c.name),
    });

    return {
      success: false,
      error: error.message || 'Unknown error occurred during offer research',
      timestamp: Date.now(),
    };
  }
}
