import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { DISCOVER_CASINO_SYSTEM_PROMPT, DISCOVER_CASINO_USER_PROMPT } from '../lib/constants';
import { DiscoverCasinoSchema } from '../schema/schema';
import { logger } from '@/lib/logger';
import { aiUsageTracker } from '@/lib/ai-cost-tracker';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function DiscoverCasino() {
  const startTime = Date.now();

  try {
    logger.aiOperation('Casino discovery', 'gpt-4o-mini', {
      function: 'DiscoverCasino',
    });

    const response = await client.responses.parse({
      model: 'gpt-4o-mini',
      tools: [{ type: 'web_search' }],
      input: [
        {
          role: 'system',
          content: DISCOVER_CASINO_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: DISCOVER_CASINO_USER_PROMPT,
        },
      ],
      text: {
        format: zodTextFormat(DiscoverCasinoSchema, 'discoverCasino'),
      },
    });

    const duration = Date.now() - startTime;

    if (!response.output_parsed) {
      // Track failed AI call
      await aiUsageTracker.trackFromResponse(response, {
        model: 'gpt-4o-mini',
        operation: 'casino-discovery',
        durationMs: duration,
      });

      logger.error('No recommendations generated from OpenAI response', undefined, {
        function: 'DiscoverCasino',
        model: 'gpt-4o-mini',
      });
      throw new Error('No recommendations generated');
    }

    // Track successful AI call
    const usageResult = await aiUsageTracker.trackFromResponse(response, {
      model: 'gpt-4o-mini',
      operation: 'casino-discovery',
      durationMs: duration,
      context: {
        statesCount: response.output_parsed.discoverCasino?.length || 0,
      },
    });

    logger.info('Casino discovery completed', {
      function: 'DiscoverCasino',
      statesCount: response.output_parsed.discoverCasino?.length || 0,
      duration,
    });

    return {
      ...response.output_parsed,
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
        operation: 'casino-discovery',
        inputTokens: 0,
        outputTokens: 0,
        durationMs: duration,
        success: false,
        error: error.message,
      });
    } catch (trackError) {
      // Ignore tracking errors
    }

    logger.error('AI casino discovery failed', error, {
      function: 'DiscoverCasino',
      duration,
    });
    throw error;
  }
}
