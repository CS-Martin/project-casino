/**
 * Utility functions for validating offer data
 */

/**
 * Checks if an offer is expired based on its valid_until date
 * @param validUntil - The valid_until date string (ISO format or other parseable date)
 * @returns true if the offer is expired, false if still valid or no date provided
 */
export function isOfferExpired(validUntil?: string): boolean {
  if (!validUntil) {
    return false; // No expiration date means it's still valid
  }

  try {
    const expirationDate = new Date(validUntil);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(expirationDate.getTime())) {
      console.warn(`Invalid date format for valid_until: ${validUntil}`);
      return false; // If we can't parse the date, assume it's still valid
    }

    return expirationDate < now;
  } catch (error) {
    console.warn(`Error parsing valid_until date: ${validUntil}`, error);
    return false; // If there's an error parsing, assume it's still valid
  }
}

/**
 * Filters out expired offers from an array of offers
 * @param offers - Array of offers to filter
 * @returns Array of offers that are not expired
 */
export function filterExpiredOffers<T extends { valid_until?: string }>(offers: T[]): T[] {
  return offers.filter((offer) => !isOfferExpired(offer.valid_until));
}

/**
 * Validates an offer and returns whether it should be created
 * @param offer - The offer to validate
 * @returns Object with validation result and reason
 */
export function validateOffer(offer: { valid_until?: string; offer_name: string }) {
  const isExpired = isOfferExpired(offer.valid_until);

  if (isExpired) {
    return {
      isValid: false,
      reason: `Offer "${offer.offer_name}" is expired (valid_until: ${offer.valid_until})`,
      shouldCreate: false,
    };
  }

  return {
    isValid: true,
    reason: 'Offer is valid and not expired',
    shouldCreate: true,
  };
}
