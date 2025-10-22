/**
 * Rate Limit Test Endpoint
 *
 * Simple endpoint to test rate limiting functionality
 * Use this to verify rate limits are working correctly
 *
 * Test with:
 * ```bash
 * # Bash/Linux
 * for i in {1..15}; do curl http://localhost:3000/api/test-rate-limit; echo ""; done
 *
 * # PowerShell
 * 1..15 | ForEach-Object { Invoke-RestMethod http://localhost:3000/api/test-rate-limit }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatRateLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit (using chat limiter: 5 requests per minute)
    const rateLimitResult = await chatRateLimiter.check(clientIp);

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', {
        ip: clientIp,
        endpoint: '/api/test-rate-limit',
        limit: rateLimitResult.limit,
      });
      return createRateLimitResponse(rateLimitResult.reset);
    }

    // Log successful request
    logger.info('Rate limit test request', {
      ip: clientIp,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    });

    // Calculate seconds until reset
    const secondsUntilReset = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        message: 'Hi! Rate limit test successful.',
        timestamp: new Date().toISOString(),
        rateLimit: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetsIn: `${secondsUntilReset} seconds`,
          resetAt: new Date(rateLimitResult.reset).toISOString(),
        },
        ip: clientIp,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    logger.error('Rate limit test error', error as Error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
