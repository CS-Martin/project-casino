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
 */

import { NextRequest, NextResponse } from 'next/server';
import { createChatStream } from '@/features/chatbot/lib/stream-handler';

export async function POST(request: NextRequest) {
  try {
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
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
