/**
 * Upstash Redis Rate Limiter (Production Alternative)
 *
 * For production use with distributed rate limiting across serverless instances.
 * This is a more robust solution than in-memory rate limiting.
 *
 * Setup:
 * 1. Create Upstash Redis database: https://console.upstash.com/
 * 2. Install: npm install @upstash/ratelimit @upstash/redis
 * 3. Add env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * 4. Uncomment and use this instead of rate-limiter.ts
 */

/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Chat endpoint rate limiter
export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true, // Track analytics in Upstash dashboard
  prefix: 'ratelimit:chat',
});

// General API rate limiter
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
});

// Strict rate limiter
export const strictRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
  prefix: 'ratelimit:strict',
});

// Usage in API route:
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await chatRateLimiter.limit(ip);

  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // Process request...
}
*/

export {};
