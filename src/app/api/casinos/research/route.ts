import { NextResponse } from 'next/server';
import { DiscoverCasino } from '@/features/casino-discovery/ai-agent/discover-casino';
import { CasinoDiscoveryService } from '@/features/casino-discovery/services/casino-discovery.service';

export async function POST() {
  try {
    const discovered = await DiscoverCasino();
    const result = await CasinoDiscoveryService.saveDiscoveredCasinos(discovered.discoverCasino);

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
}
