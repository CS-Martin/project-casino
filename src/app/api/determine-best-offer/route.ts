import { NextRequest, NextResponse } from 'next/server';
import {
  determineBestOffer,
  type OfferForAnalysis,
} from '@/features/promotional-research/ai-agent/determine-best-offer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { casinoName, casinoId, offers } = body as {
      casinoName: string;
      casinoId: string;
      offers: OfferForAnalysis[];
    };

    // Validate input
    if (!casinoName || !casinoId || !offers || !Array.isArray(offers)) {
      return NextResponse.json(
        { error: 'Invalid request: casinoName, casinoId, and offers array are required' },
        { status: 400 }
      );
    }

    if (offers.length === 0) {
      return NextResponse.json({ error: 'No offers provided for analysis' }, { status: 400 });
    }

    // Call AI agent (with Redis caching)
    const result = await determineBestOffer(casinoName, casinoId, offers);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Analysis failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached || false,
    });
  } catch (error: any) {
    console.error('Best offer determination API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
