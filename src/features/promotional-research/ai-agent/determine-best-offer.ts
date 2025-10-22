import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { BestOfferResult, BestOfferResultSchema } from '../schema/best-offer-result-schema';
import { BEST_OFFER_SYSTEM_PROMPT, createBestOfferUserPrompt } from '../lib/constants';
import redis from '@/lib/redis';

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
  try {
    // Validate input
    if (!offers || offers.length === 0) {
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
        return {
          success: true,
          data: cachedResult,
          cached: true,
        };
      }
    } catch (cacheError) {
      console.error('Redis cache read error:', cacheError);
      // Continue with AI analysis if cache fails
    }

    if (offers.length === 1) {
      // If only one offer, return it as the best by default (no need to cache this)
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

    if (!response.output_parsed) {
      throw new Error('No analysis result generated from AI');
    }

    const parsedData = response.output_parsed as any;

    // The data might be nested under 'analysis' key
    const analysisData = parsedData.analysis || parsedData;

    // Save to Redis cache
    try {
      await redis.set(cacheKey, analysisData, { ex: CACHE_TTL_SECONDS });
    } catch (cacheError) {
      console.error('Redis cache write error:', cacheError);
      // Don't fail the request if cache write fails
    }

    return {
      success: true,
      data: analysisData as BestOfferResult,
      cached: false,
    };
  } catch (error: any) {
    console.error('AI best offer determination failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during analysis',
    };
  }
}
