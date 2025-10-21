import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { BestOfferResult } from '@/features/promotional-research/schema/best-offer-result-schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const casinoId = searchParams.get('casinoId');

    if (!casinoId) {
      return NextResponse.json({ error: 'casinoId is required' }, { status: 400 });
    }

    // Check Redis cache only (no AI generation)
    const cacheKey = `best-offer:${casinoId}`;
    const cachedResult = await redis.get<BestOfferResult>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
      cached: false,
    });
  } catch (error: any) {
    console.error('Get cached best offer API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
