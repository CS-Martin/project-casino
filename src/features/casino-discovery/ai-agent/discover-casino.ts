import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { DISCOVER_CASINO_SYSTEM_PROMPT, DISCOVER_CASINO_USER_PROMPT } from '../lib/constants';
import { DiscoverCasinoSchema } from '../schema/schema';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function DiscoverCasino() {
  console.log('🔍 Running batched casino research for all states...');

  try {
    const response = await client.responses.parse({
      model: 'gpt-4o-mini', // "gpt-5-nano" or "gpt-4o-mini" for faster and better precision
      // reasoning: { effort: 'medium' },
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
      console.error('❌ No recommendations generated from OpenAI response');
      throw new Error('No recommendations generated');
    }

    console.log('✅ Batched research completed successfully.', response.output_parsed);

    return response.output_parsed;
  } catch (error: any) {
    console.error('❌ AI request failed:', error);
    throw error;
  }
}
