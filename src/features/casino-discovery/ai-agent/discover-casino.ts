import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { DISCOVER_CASINO_SYSTEM_PROMPT, DISCOVER_CASINO_USER_PROMPT } from '../lib/constants';
import { DiscoverCasinoSchema } from '../schema/schema';
import { logger } from '@/lib/logger';

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

    if (!response.output_parsed) {
      logger.error('No recommendations generated from OpenAI response', undefined, {
        function: 'DiscoverCasino',
        model: 'gpt-4o-mini',
      });
      throw new Error('No recommendations generated');
    }

    const duration = Date.now() - startTime;
    logger.info('Casino discovery completed', {
      function: 'DiscoverCasino',
      statesCount: response.output_parsed.discoverCasino?.length || 0,
      duration,
    });

    return response.output_parsed;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('AI casino discovery failed', error, {
      function: 'DiscoverCasino',
      duration,
    });
    throw error;
  }
}
