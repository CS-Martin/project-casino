import { DiscoverCasino } from '../schema/schema';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export class CasinoDiscoveryService {
  /**
   * Process AI-discovered casinos and save them to the database
   */
  static async saveDiscoveredCasinos(discoveredData: DiscoverCasino[]) {
    const results = [];

    for (const stateData of discoveredData) {
      try {
        // Get or create state
        const stateId = await convex.mutation(api.states.index.getOrCreateState, {
          name: this.getStateName(stateData.state_abbreviation),
          abbreviation: stateData.state_abbreviation,
        });

        // Prepare casinos for this state
        const casinosToSave = stateData.casinos.map((casino) => ({
          name: casino.casino_name,
          website: casino.website,
          license_status: casino.license_status,
          source_url: casino.source_url,
          state_id: stateId,
          is_tracked: false, // Mark as false because these are newly discovered and not yet in the main database
        }));

        // Save all casinos for this state
        const savedCasinos = await convex.mutation(api.casinos.index.createMultipleCasinos, {
          casinos: casinosToSave,
        });

        results.push({
          state: stateData.state_abbreviation,
          casinos: savedCasinos,
        });

        console.log(`✅ Saved ${savedCasinos.length} casinos for ${stateData.state_abbreviation}`);
      } catch (error) {
        console.error(`❌ Error saving casinos for ${stateData.state_abbreviation}:`, error);
        results.push({
          state: stateData.state_abbreviation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get full state name from abbreviation
   */
  private static getStateName(abbreviation: string): string {
    const stateNames: Record<string, string> = {
      NJ: 'New Jersey',
      PA: 'Pennsylvania',
      MI: 'Michigan',
      WV: 'West Virginia',
    };
    return stateNames[abbreviation] || abbreviation;
  }
}
