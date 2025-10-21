import redis from '@/lib/redis';

/**
 * Invalidates the cached best offer analysis for a specific casino
 * Should be called when:
 * - New offers are added
 * - Existing offers are updated
 * - Offers are deleted or expired
 */
export async function invalidateBestOfferCache(casinoId: string): Promise<void> {
  const cacheKey = `best-offer:${casinoId}`;

  try {
    await redis.del(cacheKey);
    console.log(`🗑️  Invalidated best offer cache for casino: ${casinoId}`);
  } catch (error) {
    console.error('Failed to invalidate best offer cache:', error);
    // Don't throw - cache invalidation failure shouldn't break the app
  }
}

/**
 * Invalidates all cached best offer analyses
 * Use with caution - only for bulk operations or maintenance
 */
export async function invalidateAllBestOfferCaches(): Promise<void> {
  try {
    const keys = await redis.keys('best-offer:*');

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️  Invalidated ${keys.length} best offer caches`);
    } else {
      console.log('No best offer caches to invalidate');
    }
  } catch (error) {
    console.error('Failed to invalidate all best offer caches:', error);
  }
}

/**
 * Gets the TTL (time to live) for a cached best offer analysis
 */
export async function getBestOfferCacheTTL(casinoId: string): Promise<number | null> {
  const cacheKey = `best-offer:${casinoId}`;

  try {
    const ttl = await redis.ttl(cacheKey);
    return ttl > 0 ? ttl : null;
  } catch (error) {
    console.error('Failed to get cache TTL:', error);
    return null;
  }
}
