import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Doc } from '@convex/_generated/dataModel';
import { CasinoDuplicateDetector } from '@/features/casino-discovery/services/casino-duplicate-detector.service';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced normalization with more comprehensive word removal
 */
export function normalizeCasinoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(online|casino|gaming|play|slots|sportsbook|betting|sports|book|mobile|app|site)\b/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Backward compatibility
export function isSameCasino(a: string, b: string): boolean {
  return CasinoDuplicateDetector.isSameCasino(a, b);
}

export function findDuplicateCasino(
  newCasino: Doc<'casinos'>,
  existingCasinos: Array<Doc<'casinos'> & { state?: Doc<'states'> }>
) {
  const result = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);
  return result.duplicate;
}
