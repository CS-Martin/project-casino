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

    // STEP 2.5: Log AI usage to database
    if (discoveryResult.usage) {
      try {
        await ctx.runMutation(api.ai_usage.index.logAIUsage, {
          model: 'gpt-4o-mini',
          operation: 'casino-discovery',
          input_tokens: discoveryResult.usage.inputTokens,
          output_tokens: discoveryResult.usage.outputTokens,
          total_tokens: discoveryResult.usage.totalTokens,
          estimated_cost: discoveryResult.usage.estimatedCost,
          duration_ms: Date.now() - startTime,
          success: !!discoveryResult.discoverCasino,
          context: {
            statesCount: discoveryResult.discoverCasino?.length || 0,
          },
        });
      } catch (logError) {
        // Don't fail the whole operation if logging fails
        console.error('Failed to log AI usage:', logError);
      }
    }

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
      savedCasinos: [] as Array<{
        name: string;
        state: string;
        website?: string;
      }>,
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

          // Create casino object for duplicate checking
          const newCasino = {
            name: discoveredCasino.casino_name,
            website: discoveredCasino.website,
            license_status: discoveredCasino.license_status,
            source_url: discoveredCasino.source_url,
            state_id: stateId,
            is_tracked: false,
          };

          // Check for duplicates using enhanced duplicate detection
          const duplicateResult = findDuplicateCasinoEnhanced(newCasino, existingCasinos);

          if (duplicateResult.duplicate) {
            processingResults.totalSkipped++;
            processingResults.duplicates.push({
              discovered: discoveredCasino.casino_name,
              existing: duplicateResult.duplicate.name,
              reason: duplicateResult.reason,
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
            processingResults.savedCasinos.push({
              name: discoveredCasino.casino_name,
              state: stateData.state_abbreviation,
              website: discoveredCasino.website,
            });
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
      saved_casinos: processingResults.savedCasinos,
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
 * Enhanced duplicate detection with proper normalization
 * Removes common words like "online", "casino", "gaming" to better detect duplicates
 */
function normalizeCasinoName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(online|casino|gaming|play|slots|sportsbook|betting|sports|book|mobile|app|site|llc|inc|ltd|corp|corporation)\b/gi,
      ''
    )
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Helper: Enhanced duplicate detection using word contains, normalization and fuzzy matching
 */
function findDuplicateCasinoEnhanced(
  newCasino: { name: string; state_id: any },
  existingCasinos: any[]
): { duplicate: any | null; reason: string } {
  // Only compare casinos in the same state
  const sameStateCasinos = existingCasinos.filter((c) => c.state_id === newCasino.state_id);

  for (const existing of sameStateCasinos) {
    // Strategy 1: Simple word contains check (before normalization)
    // Check if one casino name contains the other as a whole word
    const newNameLower = newCasino.name.toLowerCase();
    const existingNameLower = existing.name.toLowerCase();

    // Extract core brand name (first significant word before common words)
    const extractCoreName = (name: string): string => {
      const words = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !['online', 'casino', 'gaming', 'llc', 'inc'].includes(w));
      return words[0] || '';
    };

    const newCoreName = extractCoreName(newCasino.name);
    const existingCoreName = extractCoreName(existing.name);

    // If both names start with the same core brand name, consider it a duplicate
    if (newCoreName && existingCoreName && newCoreName === existingCoreName) {
      return { duplicate: existing, reason: 'same_brand_name' };
    }

    // Strategy 2: Exact match after full normalization
    const normalizedNewName = normalizeCasinoName(newCasino.name);
    const normalizedExisting = normalizeCasinoName(existing.name);

    if (normalizedNewName === normalizedExisting) {
      return { duplicate: existing, reason: 'exact_match_normalized' };
    }

    // Strategy 3: Contains match after normalization
    if (
      normalizedNewName.length > 0 &&
      normalizedExisting.length > 0 &&
      (normalizedNewName.includes(normalizedExisting) || normalizedExisting.includes(normalizedNewName))
    ) {
      return { duplicate: existing, reason: 'contains_match_normalized' };
    }

    // Strategy 4: Fuzzy match - check if both normalize to very similar strings
    const lengthDiff = Math.abs(normalizedNewName.length - normalizedExisting.length);
    if (lengthDiff <= 2) {
      // Calculate simple similarity (Levenshtein-like check)
      const similarity = calculateSimpleSimilarity(normalizedNewName, normalizedExisting);
      if (similarity >= 0.85) {
        return { duplicate: existing, reason: 'fuzzy_match_normalized' };
      }
    }
  }

  return { duplicate: null, reason: 'no_match' };
}

/**
 * Calculate simple similarity between two strings (0-1)
 */
function calculateSimpleSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export const scheduledCasinoDiscoveryArgs = {};
