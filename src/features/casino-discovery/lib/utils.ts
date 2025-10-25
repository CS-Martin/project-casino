import { Doc } from '@convex/_generated/dataModel';
import { CasinoDuplicateDetector } from '../services/casino-duplicate-detector.service';

/**
 * Enhanced normalization with more comprehensive word removal
 * Removes common casino-related words and corporate suffixes to detect duplicates
 */
export function normalizeCasinoName(name: string): string {
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
 * Checks if two casino names are the same after normalization.
 * @param a - The first casino name to compare.
 * @param b - The second casino name to compare.
 * @returns True if the two casino names are the same after normalization, false otherwise.
 */
export function isSameCasino(a: string, b: string): boolean {
  return CasinoDuplicateDetector.isSameCasino(a, b);
}

/**
 * Finds a duplicate casino based on its state abbreviation and normalized name.
 * @param newCasino - The new casino to find a duplicate for.
 * @param existingCasinos - The existing casinos to search for a duplicate in.
 * @returns The duplicate casino if found, null otherwise.
 */
export function findDuplicateCasino(
  newCasino: Doc<'casinos'>,
  existingCasinos: Array<Doc<'casinos'> & { state?: Doc<'states'> }>
) {
  const result = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);
  return result.duplicate;
}
