import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/offers/research - Trigger offer research
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { casinoIds, batchSize } = body;

    const result = await convex.action(api.offers.index.triggerOfferResearch, {
      casinoIds,
      batchSize,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Offer research completed successfully',
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Offer research failed',
          data: result,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ API: Offer research trigger failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
