import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';
import { logger } from '@/lib/logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET /api/offers/research/status - Get research status
export async function GET() {
  const startTime = Date.now();

  try {
    const status = await convex.query(api.offers.index.getOfferResearchStatus, {});
    const duration = Date.now() - startTime;

    logger.apiResponse('GET', '/api/offers/research/status', 200, duration);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Failed to get offer research status', error, {
      path: '/api/offers/research/status',
      duration,
    });

    logger.apiResponse('GET', '/api/offers/research/status', 500, duration);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
