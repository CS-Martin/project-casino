import { normalizeCasinoName } from '@/lib/utils';
import stringSimilarity from 'string-similarity';
import { Doc } from '@convex/_generated/dataModel';

/**
 * CASINO DUPLICATE DETECTOR
 *
 * A sophisticated duplicate detection system that prevents saving duplicate casino entries
 * from web search results and AI discoveries. Uses multiple matching strategies to identify
 * variations of the same casino entity across different data sources.
 *
 * Example Use Case:
 * - Web Search Result: "BetMGM Online Casino"
 * - Database Entry:    "BetMGM"
 * - Result:           Flagged as duplicate → prevents saving duplicate data
 *
 * Matching Strategies (in order of priority):
 * 1. Exact Match: Normalized names are identical
 * 2. Contains Match: One name contains the other (most common for web vs database matches)
 * 3. Fuzzy Match: Names are similar above threshold (handles typos, minor variations)
 */
export class CasinoDuplicateDetector {
  // Similarity threshold for fuzzy matching (0-1 scale)
  // 0.75 = 75% similarity required to consider a match
  private static threshold = 0.75;

  /**
   * EXACT MATCH STRATEGY
   * Checks if two casino names are identical after normalization.
   *
   * Normalization removes:
   * - Common words: "online", "casino", "gaming", etc.
   * - Punctuation and special characters
   * - Converts to lowercase
   *
   * Example:
   * "BetMGM Casino" vs "betmgm" → true (both normalize to "betmgm")
   *
   * @param a - First casino name to compare
   * @param b - Second casino name to compare
   * @returns True if names are identical after normalization
   */
  static exactMatch(a: string, b: string): boolean {
    return normalizeCasinoName(a) === normalizeCasinoName(b);
  }

  /**
   * FUZZY MATCH STRATEGY
   * Uses string similarity algorithm to find names that are similar but not identical.
   * Handles minor variations, typos, and different word orders.
   *
   * Algorithm: Dice's Coefficient (string-similarity package)
   * Compares character bigrams to calculate similarity score.
   *
   * Example:
   * "Bet MGM" vs "BetMGM" → high similarity score → match
   * "Caesars Palace" vs "Caesars" → lower score → no match
   *
   * @param a - First casino name to compare
   * @param b - Second casino name to compare
   * @returns True if similarity score meets or exceeds threshold
   */
  static fuzzyMatch(a: string, b: string): boolean {
    const nameA = normalizeCasinoName(a);
    const nameB = normalizeCasinoName(b);
    const score = stringSimilarity.compareTwoStrings(nameA, nameB);
    return score >= this.threshold;
  }

  /**
   * CONTAINS MATCH STRATEGY
   * Checks if one casino name contains the other after normalization.
   * This is particularly effective for web search results vs database entries.
   *
   * Example:
   * "BetMGM Online Casino" contains "BetMGM" → true
   * "BetMGM" contains "BetMGM Casino" → true (bidirectional check)
   *
   * @param a - First casino name to compare
   * @param b - Second casino name to compare
   * @returns True if either name contains the other after normalization
   */
  static containsMatch(a: string, b: string): boolean {
    const nameA = normalizeCasinoName(a);
    const nameB = normalizeCasinoName(b);
    return nameA.includes(nameB) || nameB.includes(nameA);
  }

  /**
   * COMPREHENSIVE DUPLICATE CHECK
   * Combines all three matching strategies to determine if two casinos are the same entity.
   *
   * Strategy Priority Order:
   * 1. Exact Match (fastest, most reliable)
   * 2. Contains Match (catches most web vs database variations)
   * 3. Fuzzy Match (handles edge cases and minor variations)
   *
   * @param a - First casino name to compare
   * @param b - Second casino name to compare
   * @returns True if any matching strategy identifies the names as duplicates
   */
  static isSameCasino(a: string, b: string): boolean {
    return this.exactMatch(a, b) || this.containsMatch(a, b) || this.fuzzyMatch(a, b);
  }

  /**
   * ENHANCED DUPLICATE DETECTION WITH DETAILED REPORTING
   *
   * Main method for detecting duplicates in real-world scenarios. Compares a newly
   * discovered casino against existing database entries and provides detailed match
   * information for logging and decision making.
   *
   * Features:
   * - State-based filtering (only compares casinos in same state)
   * - Detailed match reasoning for analytics
   * - Similarity scoring for fuzzy matches
   * - Clear return structure for easy integration
   *
   * @param newCasino - Newly discovered casino from web search/AI
   * @param existingCasinos - Array of existing casinos from database
   * @returns Object containing:
   *   - duplicate: Matching casino object if found, null otherwise
   *   - reason: Type of match detected ('exact_match', 'contains_match', 'fuzzy_match', 'no_match')
   *   - score: Similarity score (only for fuzzy matches)
   *
   * @example
   * const result = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);
   * if (result.duplicate) {
   *   console.log(`Skipping duplicate: ${newCasino.name} → ${result.duplicate.name} (${result.reason})`);
   * }
   */
  static findDuplicateCasino(
    newCasino: Partial<Doc<'casinos'>>,
    existingCasinos: Array<Doc<'casinos'> & { state?: Doc<'states'> }>
  ): { duplicate: Doc<'casinos'> | null; reason: string; score?: number } {
    // Only compare casinos in the same state (regulatory requirement)
    const sameStateCasinos = existingCasinos.filter((c) => c.state_id === newCasino.state_id);

    // Check each existing casino in the same state for potential matches
    for (const existing of sameStateCasinos) {
      // STRATEGY 1: Exact Match (Fastest - Check First)
      if (this.exactMatch(existing.name, newCasino.name!)) {
        return { duplicate: existing, reason: 'exact_match' };
      }

      // STRATEGY 2: Contains Match (Most Common for Web vs Database)
      if (this.containsMatch(existing.name, newCasino.name!)) {
        return { duplicate: existing, reason: 'contains_match' };
      }

      // STRATEGY 3: Fuzzy Match (Handles Edge Cases)
      const nameA = normalizeCasinoName(existing.name);
      const nameB = normalizeCasinoName(newCasino.name!);
      const score = stringSimilarity.compareTwoStrings(nameA, nameB);

      if (score >= this.threshold) {
        return { duplicate: existing, reason: 'fuzzy_match', score };
      }
    }

    // No duplicate found - safe to save new casino
    return { duplicate: null, reason: 'no_match' };
  }
}
