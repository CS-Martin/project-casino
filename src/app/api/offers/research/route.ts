import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { logger } from '@/lib/logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/offers/research - Trigger offer research
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { casinoIds, batchSize } = body;

    logger.apiRequest('POST', '/api/offers/research', {
      casinoIds: casinoIds?.length || 0,
      batchSize,
    });

    const result = await convex.action(api.offers.index.triggerOfferResearch, {
      casinoIds,
      batchSize,
    });

    const duration = Date.now() - startTime;

    if (result.success) {
      logger.apiResponse('POST', '/api/offers/research', 200, duration, {
        offersResearched: (result as any).offersProcessed || 0,
      });

      return NextResponse.json({
        success: true,
        message: 'Offer research completed successfully',
        data: result,
      });
    } else {
      logger.apiResponse('POST', '/api/offers/research', 500, duration, {
        error: (result as any).error,
      });

      return NextResponse.json(
        {
          success: false,
          error: (result as any).error || 'Offer research failed',
          data: result,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Offer research trigger failed', error, {
      path: '/api/offers/research',
      duration,
    });

    logger.apiResponse('POST', '/api/offers/research', 500, duration);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
