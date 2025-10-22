import { ActionCtx, internalAction } from '../../_generated/server';
import { api } from '../../_generated/api';
import { Doc } from '../../_generated/dataModel';

/**
 * Scheduled action to discover new casinos via AI
 * This is triggered by a cron job every 12 hours
 * Follows the same pattern as processOfferResearchBatchAction.ts
 */
export const scheduledCasinoDiscoveryHandler = async (ctx: ActionCtx) => {
  const startTime = Date.now();
  const triggeredBy = 'cron';

  try {
    // STEP 1: Dynamic import of AI discovery service
    // We import this dynamically to avoid module load issues during Convex analysis
    const { DiscoverCasino } = await import('../../../src/features/casino-discovery/ai-agent/discover-casino');

    // STEP 2: Call AI service to discover casinos
    // This makes an external API call to OpenAI with web search capabilities
    const discoveryResult = await DiscoverCasino();

    if (!discoveryResult || !discoveryResult.discoverCasino) {
      const duration = Date.now() - startTime;
      const errorMessage = 'AI discovery returned no results';

      await ctx.runMutation(api.casino_discovery_logs.index.createDiscoveryLog, {
        timestamp: Date.now(),
        casinos_discovered: 0,
        casinos_saved: 0,
        casinos_skipped: 0,
        duration_ms: duration,
        success: false,
        error: errorMessage,
        triggered_by: triggeredBy,
      });

      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }

    // STEP 3: Process discovery results
    const processingResults = {
      totalDiscovered: 0,
      totalSaved: 0,
      totalSkipped: 0,
      duplicates: [] as Array<{
        discovered: string;
        existing: string;
        reason: string;
        score?: number;
      }>,
      statesSearched: new Set<string>(),
    };

    // STEP 4: Process each state's discovered casinos
    for (const stateData of discoveryResult.discoverCasino) {
      try {
        processingResults.statesSearched.add(stateData.state_abbreviation);

        // Get or create state
        const stateId = await ctx.runMutation(api.states.index.getOrCreateState, {
          name: getStateName(stateData.state_abbreviation),
          abbreviation: stateData.state_abbreviation,
        });

        // Get existing casinos for this state
        const existingCasinos = await ctx.runQuery(api.casinos.index.getCasinosByState, {
          stateAbbreviation: stateData.state_abbreviation,
        });

        // Process each discovered casino
        for (const discoveredCasino of stateData.casinos) {
          processingResults.totalDiscovered++;

          // Check for duplicates using name matching
          const duplicate = findDuplicateCasino(discoveredCasino.casino_name, existingCasinos);

          if (duplicate) {
            processingResults.totalSkipped++;
            processingResults.duplicates.push({
              discovered: discoveredCasino.casino_name,
              existing: duplicate.name,
              reason: 'Similar name found',
            });
          } else {
            // Create new casino
            await ctx.runMutation(api.casinos.index.createCasino, {
              name: discoveredCasino.casino_name,
              website: discoveredCasino.website,
              license_status: discoveredCasino.license_status,
              source_url: discoveredCasino.source_url,
              state_id: stateId,
              is_tracked: false,
            });
            processingResults.totalSaved++;
          }
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${stateData.state_abbreviation}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    // STEP 5: Log successful discovery
    await ctx.runMutation(api.casino_discovery_logs.index.createDiscoveryLog, {
      timestamp: Date.now(),
      casinos_discovered: processingResults.totalDiscovered,
      casinos_saved: processingResults.totalSaved,
      casinos_skipped: processingResults.totalSkipped,
      duplicates: processingResults.duplicates,
      states_searched: Array.from(processingResults.statesSearched),
      duration_ms: duration,
      success: true,
      triggered_by: triggeredBy,
    });

    return {
      success: true,
      discovered: processingResults.totalDiscovered,
      saved: processingResults.totalSaved,
      skipped: processingResults.totalSkipped,
      duplicates: processingResults.duplicates.length,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Scheduled casino discovery error:', error);

    // Log error
    await ctx.runMutation(api.casino_discovery_logs.index.createDiscoveryLog, {
      timestamp: Date.now(),
      casinos_discovered: 0,
      casinos_saved: 0,
      casinos_skipped: 0,
      duration_ms: duration,
      success: false,
      error: error.message || 'Unknown error',
      triggered_by: triggeredBy,
    });

    return {
      success: false,
      error: error.message || 'Unknown error',
      duration,
    };
  }
};

/**
 * Helper: Get full state name from abbreviation
 */
function getStateName(abbreviation: string): string {
  const stateNames: Record<string, string> = {
    NJ: 'New Jersey',
    PA: 'Pennsylvania',
    MI: 'Michigan',
    WV: 'West Virginia',
    CT: 'Connecticut',
    DE: 'Delaware',
    NY: 'New York',
  };
  return stateNames[abbreviation] || abbreviation;
}

/**
 * Helper: Simple duplicate detection by name similarity
 */
function findDuplicateCasino(name: string, existingCasinos: any[]): any | null {
  const normalizedName = name.toLowerCase().trim();

  for (const existing of existingCasinos) {
    const existingNormalized = existing.name.toLowerCase().trim();

    // Exact match
    if (normalizedName === existingNormalized) {
      return existing;
    }

    // Contains match (one is substring of other)
    if (normalizedName.includes(existingNormalized) || existingNormalized.includes(normalizedName)) {
      return existing;
    }
  }

  return null;
}

export const scheduledCasinoDiscoveryArgs = {};
