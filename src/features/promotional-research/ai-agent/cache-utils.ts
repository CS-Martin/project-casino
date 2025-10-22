import redis from '@/lib/redis';
import { logger } from '@/lib/logger';

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
    logger.cacheOperation('delete', cacheKey, {
      function: 'invalidateBestOfferCache',
      casinoId,
    });
  } catch (error) {
    logger.error('Failed to invalidate best offer cache', error, {
      function: 'invalidateBestOfferCache',
      cacheKey,
      casinoId,
    });
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
      logger.info('Invalidated all best offer caches', {
        function: 'invalidateAllBestOfferCaches',
        count: keys.length,
      });
    } else {
      logger.info('No best offer caches to invalidate', {
        function: 'invalidateAllBestOfferCaches',
      });
    }
  } catch (error) {
    logger.error('Failed to invalidate all best offer caches', error, {
      function: 'invalidateAllBestOfferCaches',
    });
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
    logger.error('Failed to get cache TTL', error, {
      function: 'getBestOfferCacheTTL',
      cacheKey,
      casinoId,
    });
    return null;
  }
}
