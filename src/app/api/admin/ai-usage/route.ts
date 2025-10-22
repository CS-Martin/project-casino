import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET /api/admin/ai-usage - Get AI usage statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';

    // Calculate time range
    const now = Date.now();
    let since: number;

    switch (period) {
      case '1h':
        since = now - 60 * 60 * 1000;
        break;
      case '24h':
        since = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        since = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        since = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        since = now - 24 * 60 * 60 * 1000;
    }

    // Get stats from Convex
    const stats = await convex.query(api.ai_usage.index.getAIUsageStats, {
      since,
    });

    // Get recent usage
    const recentUsage = await convex.query(api.ai_usage.index.getRecentAIUsage, {
      limit: 10,
    });

    return NextResponse.json({
      success: true,
      period,
      data: {
        stats,
        recentUsage,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch AI usage stats',
      },
      { status: 500 }
    );
  }
}
