import { DiscoverCasino } from '../schema/schema';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { findDuplicateCasino } from '@/lib/utils';
import { Doc } from '../../../../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export class CasinoDiscoveryService {
  /**
   * Process AI-discovered casinos and save them to the database
   */
  static async saveDiscoveredCasinos(discoveredData: DiscoverCasino[]) {
    for (const stateData of discoveredData) {
      try {
        // Get or create state
        const stateId = await convex.mutation(api.states.index.getOrCreateState, {
          name: this.getStateName(stateData.state_abbreviation),
          abbreviation: stateData.state_abbreviation,
        });

        // Get existing casinos for this state to check for duplicates
        const existingCasinos = await convex.query(api.casinos.index.getCasinosByState, {
          stateAbbreviation: stateData.state_abbreviation,
        });

        // Filter out duplicates before saving
        const casinosToSave: Array<Partial<Doc<'casinos'>>> = [];
        const skippedDuplicates: string[] = [];

        for (const casino of stateData.casinos) {
          const newCasino: Partial<Doc<'casinos'>> = {
            name: casino.casino_name,
            website: casino.website,
            license_status: casino.license_status,
            source_url: casino.source_url,
            state_id: stateId,
            is_tracked: false,
          };

          // Check if this casino already exists using fuzzy matching
          const duplicate = findDuplicateCasino(newCasino as Doc<'casinos'>, existingCasinos);

          if (duplicate) {
            // Skip duplicate - don't save to database
            skippedDuplicates.push(casino.casino_name);
            console.log(`⏭️ Skipped duplicate: "${casino.casino_name}" (matches existing: "${duplicate.name}")`);
          } else {
            // Only save if it's not a duplicate
            casinosToSave.push({
              name: casino.casino_name,
              website: casino.website,
              license_status: casino.license_status,
              source_url: casino.source_url,
              state_id: stateId,
              is_tracked: false,
            });
          }
        }

        // Save only non-duplicate casinos
        if (casinosToSave.length > 0) {
          await convex.mutation(api.casinos.index.createMultipleCasinos, {
            casinos: casinosToSave as Array<Doc<'casinos'>>,
          });
        }
      } catch (error) {
        console.error(`❌ Error saving casinos for ${stateData.state_abbreviation}:`, error);
      }
    }
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
