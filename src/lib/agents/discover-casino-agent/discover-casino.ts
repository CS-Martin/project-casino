import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { DiscoverCasinoSchema } from './schema';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function DiscoverCasino() {
  console.log('🔍 Running batched casino research for all states...');

  try {
    const response = await client.responses.parse({
      model: 'gpt-5-nano', // or "gpt-5-nano" if you prefer, but 4o-mini is faster + higher rate limit
      tools: [{ type: 'web_search' }],
      reasoning: { effort: 'low' },
      input: [
        {
          role: 'system',
          content: `
          You are an AI research assistant specialized in U.S. gambling regulation.
          Your task is to identify exactly 2 licensed and operational **online casinos** in each of these U.S. states:
          - New Jersey (NJ)
          - Pennsylvania (PA)
          - Michigan (MI)
          - West Virginia (WV)

          Strict rules:
          1. Use only official or authoritative sources (.gov, state gaming commissions, regulatory sites).
          2. Do not include sports betting–only platforms.
          3. Respond ONLY in JSON using this schema: ${JSON.stringify(DiscoverCasinoSchema.shape)}
          4. Always include all 4 states, even if no casinos found (return empty list for that state).
          5. Do not include any explanations or extra text outside the JSON.
          `,
        },
        {
          role: 'user',
          content: 'Find and list 2 licensed online casinos for each of the 4 states using official sources only.',
        },
      ],
      tool_choice: 'auto',
      text: {
        format: zodTextFormat(DiscoverCasinoSchema, 'discoverCasino'),
      },
    });

    if (!response.output_parsed) {
      console.error('❌ No recommendations generated from OpenAI response');
      throw new Error('No recommendations generated');
    }

    console.log('✅ Batched research completed successfully.');

    return response.output_parsed;
  } catch (error: any) {
    console.error('❌ AI request failed:', error);
    throw error;
  }
}
