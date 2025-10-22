import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { BestOfferResult, BestOfferResultSchema } from '../schema/best-offer-result-schema';
import { BEST_OFFER_SYSTEM_PROMPT, createBestOfferUserPrompt } from '../lib/constants';
import redis from '@/lib/redis';
import { logger } from '@/lib/logger';
import { aiUsageTracker } from '@/lib/ai-cost-tracker';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache TTL: 6 hours (offers don't change that frequently)
const CACHE_TTL_SECONDS = 6 * 60 * 60;

export interface OfferForAnalysis {
  _id: string;
  offer_name: string;
  offer_type?: string;
  description?: string;
  expected_bonus?: number;
  expected_deposit?: number;
  wagering_requirement?: number;
  max_bonus?: number;
  min_deposit?: number;
  valid_until?: string;
  terms?: string;
  valueScore?: number;
}

export async function determineBestOffer(
  casinoName: string,
  casinoId: string,
  offers: OfferForAnalysis[]
): Promise<{ success: boolean; data?: BestOfferResult; error?: string; cached?: boolean }> {
  const startTime = Date.now();

  try {
    // Validate input
    if (!offers || offers.length === 0) {
      logger.warn('No offers provided for analysis', {
        function: 'determineBestOffer',
        casinoId,
        casinoName,
      });

      return {
        success: false,
        error: 'No offers provided for analysis',
      };
    }

    // Check Redis cache first
    const cacheKey = `best-offer:${casinoId}`;
    try {
      const cachedResult = await redis.get<BestOfferResult>(cacheKey);
      if (cachedResult) {
        logger.cacheOperation('hit', cacheKey, {
          casinoId,
          casinoName,
        });

        return {
          success: true,
          data: cachedResult,
          cached: true,
        };
      }

      logger.cacheOperation('miss', cacheKey, {
        casinoId,
        casinoName,
      });
    } catch (cacheError) {
      logger.error('Redis cache read failed', cacheError, {
        function: 'determineBestOffer',
        operation: 'cache_read',
        cacheKey,
      });
      // Continue with AI analysis if cache fails
    }

    if (offers.length === 1) {
      // If only one offer, return it as the best by default (no need to cache this)
      logger.info('Single offer detected, returning as best by default', {
        function: 'determineBestOffer',
        casinoId,
        casinoName,
        offerId: offers[0]._id,
      });

      return {
        success: true,
        data: {
          bestOfferId: offers[0]._id,
          reasoning: 'This is the only available offer for this casino.',
          score: offers[0].valueScore || 50,
          strengths: ['Only available option', 'Exclusive offer'],
          considerations: ['No alternatives to compare'],
          rankingFactors: {
            valueScore: 5,
            bonusAmount: 5,
            wageringRequirement: 5,
            easeOfUse: 5,
          },
        },
        cached: false,
      };
    }

    logger.aiOperation('Best offer determination', 'gpt-4o-mini', {
      function: 'determineBestOffer',
      casinoId,
      casinoName,
      offersCount: offers.length,
    });

    const response = await client.responses.parse({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: BEST_OFFER_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: createBestOfferUserPrompt(casinoName, offers),
        },
      ],
      text: {
        format: zodTextFormat(BestOfferResultSchema, 'analysis'),
      },
    });

    const duration = Date.now() - startTime;

    if (!response.output_parsed) {
      // Track failed AI call
      await aiUsageTracker.trackFromResponse(response, {
        model: 'gpt-4o-mini',
        operation: 'best-offer-analysis',
        durationMs: duration,
        context: {
          casinoId,
          casinoName,
          offersCount: offers.length,
        },
      });

      logger.error('No analysis result generated from AI', undefined, {
        function: 'determineBestOffer',
        casinoId,
        model: 'gpt-4o-mini',
      });
      throw new Error('No analysis result generated from AI');
    }

    // Track successful AI call
    await aiUsageTracker.trackFromResponse(response, {
      model: 'gpt-4o-mini',
      operation: 'best-offer-analysis',
      durationMs: duration,
      context: {
        casinoId,
        casinoName,
        offersCount: offers.length,
      },
    });

    const parsedData = response.output_parsed as any;

    // The data might be nested under 'analysis' key
    const analysisData = parsedData.analysis || parsedData;

    // Save to Redis cache
    try {
      await redis.set(cacheKey, analysisData, { ex: CACHE_TTL_SECONDS });
      logger.cacheOperation('set', cacheKey, {
        casinoId,
        ttl: CACHE_TTL_SECONDS,
      });
    } catch (cacheError) {
      logger.error('Redis cache write failed', cacheError, {
        function: 'determineBestOffer',
        operation: 'cache_write',
        cacheKey,
      });
      // Don't fail the request if cache write fails
    }

    logger.info('Best offer analysis completed', {
      function: 'determineBestOffer',
      casinoId,
      casinoName,
      bestOfferId: analysisData.bestOfferId,
      duration,
    });

    return {
      success: true,
      data: analysisData as BestOfferResult,
      cached: false,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Track failed AI call with error
    try {
      await aiUsageTracker.track({
        model: 'gpt-4o-mini',
        operation: 'best-offer-analysis',
        inputTokens: 0,
        outputTokens: 0,
        durationMs: duration,
        success: false,
        error: error.message,
        context: {
          casinoId,
          casinoName,
          offersCount: offers.length,
        },
      });
    } catch (trackError) {
      // Ignore tracking errors
    }

    logger.error('AI best offer determination failed', error, {
      function: 'determineBestOffer',
      casinoId,
      casinoName,
      duration,
    });

    return {
      success: false,
      error: error.message || 'Unknown error occurred during analysis',
    };
  }
}
