/**
 * Chat API Route
 *
 * Handles chat messages from the Agent Martian chatbot.
 * Uses OpenAI to process messages and stream responses back to the client.
 *
 * Features:
 * - Server-Sent Events (SSE) for streaming responses
 * - Function calling for database queries
 * - Read-only access to casino data
 * - Rate limiting (20 requests/minute per IP)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createChatStream } from '@/features/chatbot/lib/stream-handler';
import { chatRateLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const rateLimitResult = await chatRateLimiter.check(clientIp);

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', {
        ip: clientIp,
        endpoint: '/api/chat',
        limit: rateLimitResult.limit,
      });
      return createRateLimitResponse(rateLimitResult.reset, rateLimitResult.limit);
    }

    // Log successful rate limit check
    logger.info('Chat request accepted', {
      ip: clientIp,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    });

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create streaming response
    const stream = createChatStream(message);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    logger.error('Chat error', error as Error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
