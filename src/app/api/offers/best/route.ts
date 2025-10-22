import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { BestOfferResult } from '@/features/promotional-research/schema/best-offer-result-schema';
import {
  determineBestOffer,
  type OfferForAnalysis,
} from '@/features/promotional-research/ai-agent/determine-best-offer';
import { logger } from '@/lib/logger';

// GET /api/offers/best?casinoId=xxx - Get cached best offer
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const casinoId = searchParams.get('casinoId');

    if (!casinoId) {
      logger.warn('Missing casinoId parameter', {
        path: '/api/offers/best',
        method: 'GET',
      });
      return NextResponse.json({ error: 'casinoId is required' }, { status: 400 });
    }

    // Check Redis cache only (no AI generation)
    const cacheKey = `best-offer:${casinoId}`;
    const cachedResult = await redis.get<BestOfferResult>(cacheKey);

    const duration = Date.now() - startTime;

    if (cachedResult) {
      logger.cacheOperation('hit', cacheKey);
      logger.apiResponse('GET', '/api/offers/best', 200, duration, {
        casinoId,
        cached: true,
      });

      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    logger.cacheOperation('miss', cacheKey);
    logger.apiResponse('GET', '/api/offers/best', 200, duration, {
      casinoId,
      cached: false,
    });

    return NextResponse.json({
      success: true,
      data: null,
      cached: false,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Failed to get cached best offer', error, {
      path: '/api/offers/best',
      duration,
    });

    logger.apiResponse('GET', '/api/offers/best', 500, duration);

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/offers/best - Determine best offer with AI
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { casinoName, casinoId, offers } = body as {
      casinoName: string;
      casinoId: string;
      offers: OfferForAnalysis[];
    };

    // Validate input
    if (!casinoName || !casinoId || !offers || !Array.isArray(offers)) {
      logger.warn('Invalid request parameters', {
        path: '/api/offers/best',
        method: 'POST',
        hasName: !!casinoName,
        hasId: !!casinoId,
        hasOffers: !!offers,
        isArray: Array.isArray(offers),
      });

      return NextResponse.json(
        { error: 'Invalid request: casinoName, casinoId, and offers array are required' },
        { status: 400 }
      );
    }

    if (offers.length === 0) {
      logger.warn('Empty offers array provided', {
        path: '/api/offers/best',
        casinoId,
        casinoName,
      });

      return NextResponse.json({ error: 'No offers provided for analysis' }, { status: 400 });
    }

    logger.apiRequest('POST', '/api/offers/best', {
      casinoId,
      casinoName,
      offersCount: offers.length,
    });

    // Call AI agent (with Redis caching)
    const result = await determineBestOffer(casinoName, casinoId, offers);
    const duration = Date.now() - startTime;

    if (!result.success) {
      logger.error('Best offer analysis failed', undefined, {
        casinoId,
        casinoName,
        error: result.error,
        duration,
      });

      logger.apiResponse('POST', '/api/offers/best', 500, duration);

      return NextResponse.json({ error: result.error || 'Analysis failed' }, { status: 500 });
    }

    logger.apiResponse('POST', '/api/offers/best', 200, duration, {
      casinoId,
      cached: result.cached || false,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached || false,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Best offer determination failed', error, {
      path: '/api/offers/best',
      duration,
    });

    logger.apiResponse('POST', '/api/offers/best', 500, duration);

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
