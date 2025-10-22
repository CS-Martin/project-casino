import { NextResponse } from 'next/server';
import { DiscoverCasino } from '@/features/casino-discovery/ai-agent/discover-casino';
import { CasinoDiscoveryService } from '@/features/casino-discovery/services/casino-discovery.service';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  const startTime = Date.now();
  const triggeredBy = 'manual';

  try {
    const discovered = await DiscoverCasino();
    const result = await CasinoDiscoveryService.saveDiscoveredCasinos(discovered.discoverCasino);
    const duration = Date.now() - startTime;

    const totalDiscovered = result.saved + result.skipped;

    // Extract states searched from discovered data
    const statesSearched =
      discovered.discoverCasino?.length > 0
        ? discovered.discoverCasino.map((state) => state.state_abbreviation)
        : undefined;

    // Log to discovery history
    await convex.mutation(api.casino_discovery_logs.index.createDiscoveryLog, {
      timestamp: Date.now(),
      casinos_discovered: totalDiscovered,
      casinos_saved: result.saved,
      casinos_skipped: result.skipped,
      duplicates: result.duplicates.length > 0 ? result.duplicates : undefined,
      states_searched: statesSearched,
      duration_ms: duration,
      success: true,
      triggered_by: triggeredBy,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log failed discovery
    await convex.mutation(api.casino_discovery_logs.index.createDiscoveryLog, {
      timestamp: Date.now(),
      casinos_discovered: 0,
      casinos_saved: 0,
      casinos_skipped: 0,
      duration_ms: duration,
      success: false,
      error: error?.message ?? 'Unknown error',
      triggered_by: triggeredBy,
    });

    return NextResponse.json({ ok: false, error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
}
