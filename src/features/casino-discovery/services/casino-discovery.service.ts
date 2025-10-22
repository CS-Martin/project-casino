import { DiscoverCasino } from '../schema/schema';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { CasinoDuplicateDetector } from './casino-duplicate-detector.service';
import { Doc } from '../../../../convex/_generated/dataModel';
import { logger } from '@/lib/logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface SaveResult {
  saved: number;
  skipped: number;
  savedCasinos: Array<{
    name: string;
    state: string;
    website?: string;
  }>;
  duplicates: Array<{
    discovered: string;
    existing: string;
    reason: string;
    score?: number;
  }>;
}

export class CasinoDiscoveryService {
  /**
   * Process AI-discovered casinos and save them to the database with enhanced duplicate detection
   */
  static async saveDiscoveredCasinos(discoveredData: DiscoverCasino[]): Promise<SaveResult> {
    const result: SaveResult = {
      saved: 0,
      skipped: 0,
      savedCasinos: [],
      duplicates: [],
    };

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

        // Process each discovered casino
        const casinosToSave: Array<Partial<Doc<'casinos'>>> = [];

        for (const casino of stateData.casinos) {
          const newCasino: Partial<Doc<'casinos'>> = {
            name: casino.casino_name,
            website: casino.website,
            license_status: casino.license_status,
            source_url: casino.source_url,
            state_id: stateId,
            is_tracked: false,
          };

          // Enhanced duplicate detection
          const duplicateResult = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);

          if (duplicateResult.duplicate) {
            result.skipped++;
            result.duplicates.push({
              discovered: casino.casino_name,
              existing: duplicateResult.duplicate.name,
              reason: duplicateResult.reason,
              score: duplicateResult.score,
            });
          } else {
            casinosToSave.push(newCasino);
          }
        }

        // Save only non-duplicate casinos
        if (casinosToSave.length > 0) {
          await convex.mutation(api.casinos.index.createMultipleCasinos, {
            casinos: casinosToSave as Array<Doc<'casinos'>>,
          });
          result.saved += casinosToSave.length;

          // Track saved casino details
          for (const casino of casinosToSave) {
            result.savedCasinos.push({
              name: casino.name!,
              state: stateData.state_abbreviation,
              website: casino.website,
            });
          }
        }
      } catch (error) {
        logger.error('Failed to save casinos for state', error, {
          service: 'CasinoDiscoveryService',
          function: 'saveDiscoveredCasinos',
          state: stateData.state_abbreviation,
          casinoCount: stateData.casinos.length,
        });
      }
    }

    return result;
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
      // Add more states as needed
    };
    return stateNames[abbreviation] || abbreviation;
  }
}
