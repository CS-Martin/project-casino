import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import stringSimilarity from 'string-similarity';
import { Doc } from '@convex/_generated/dataModel';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cleans and standardizes casino names before comparison.
 * Removes generic words (like "online", "casino", "gaming", etc.),
 * converts to lowercase, and strips punctuation so that variations
 * like "BetMGM Online Casino" and "BetMGM" can be compared accurately.
 *
 * @param name - Raw casino name from API or AI discovery
 * @returns Normalized version of the casino name for reliable matching
 */
export function normalizeCasinoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(online|casino|gaming|play|slots)\b/g, '') // remove filler words that add noise
    .replace(/[^a-z0-9]+/g, ' ') // remove punctuation and symbols
    .trim();
}

/**
 * Compares two casino names and checks if they likely refer
 * to the same casino entity. Uses normalized names and a fuzzy
 * similarity score (0–1). A threshold of 0.75 means 75% similarity
 * is required to consider them a potential match.
 *
 * Example:
 *  "BetMGM" vs "BetMGM Online Casino" → true
 *  "BetGold" vs "BetBold" → false
 *
 * @param a - Name of the first casino
 * @param b - Name of the second casino
 * @returns True if both names likely represent the same casino
 */
export function isSameCasino(a: string, b: string): boolean {
  const nameA = normalizeCasinoName(a);
  const nameB = normalizeCasinoName(b);
  const score = stringSimilarity.compareTwoStrings(nameA, nameB);

  return score >= 0.75; // similarity threshold for a positive match
}

/**
 * Checks whether a newly discovered casino already exists in the
 * company database for the same state. It uses fuzzy string matching
 * to account for name variations and prevents duplicate entries like
 * "BetMGM" and "BetMGM Online Casino" from being stored twice.
 *
 * @param newCasino - The newly discovered casino record
 * @param existingCasinos - List of all casinos already in the database (with state info)
 * @returns The matching existing casino if found, otherwise undefined
 */
export function findDuplicateCasino(
  newCasino: Doc<'casinos'>,
  existingCasinos: Array<Doc<'casinos'> & { state?: Doc<'states'> }>
) {
  // Restrict comparison to casinos in the same state
  const sameStateCasinos = existingCasinos.filter((c) => c.state_id === newCasino.state_id);

  // Return the first casino that has a sufficiently similar name
  return sameStateCasinos.find((c) => isSameCasino(c.name, newCasino.name));
}
