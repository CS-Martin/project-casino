import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET /api/offers/research/status - Get research status
export async function GET() {
  try {
    const status = await convex.query(api.offers.index.getOfferResearchStatus, {});

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('❌ API: Failed to get offer research status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
