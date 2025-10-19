import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  console.log('🔍 Running batched casino research for all states...');

  try {
    const response = await client.responses.create({
      model: 'gpt-5-nano', // or "gpt-5-nano" if you prefer, but 4o-mini is faster + higher rate limit
      tools: [{ type: 'web_search' }],
      input: [
        {
          role: 'system',
          content: `
          You are an AI research assistant specialized in U.S. gambling regulation.
          Your task is to identify exactly 2 licensed and operational **online casinos** in each of these U.S. states:
          - New Jersey
          - Pennsylvania
          - Michigan
          - West Virginia

          Strict rules:
          1. Use only official or authoritative sources (.gov, state gaming commissions, regulatory sites).
          2. Do not include sports betting–only platforms.
          3. Respond ONLY in pure JSON using this schema:
          [
            {
              "state": "string",
              "casinos": [
                {
                  "casino_name": "string",
                  "website": "string",
                  "license_status": "active|pending|unknown",
                  "source_url": "string"
                }
              ]
            }
          ]
          4. Always include all 4 states, even if no casinos found (return empty list for that state).
          5. Do not include any explanations or extra text outside the JSON.
          `,
        },
        {
          role: 'user',
          content: 'Find and list 2 licensed online casinos for each of the 4 states using official sources only.',
        },
      ],
    });

    const rawText = response.output_text || '[]';

    // Try to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.warn('⚠️ Could not parse AI response as JSON. Returning raw output.');
      parsed = { raw: rawText };
    }

    console.log('✅ Batched research completed successfully.');

    return new Response(JSON.stringify(parsed, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ AI request failed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
