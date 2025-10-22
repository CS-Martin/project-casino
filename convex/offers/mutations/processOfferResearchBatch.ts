import { mutation, MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import {
  researchCasinoOffers,
  CasinoForResearch,
} from '../../../src/features/promotional-research/ai-agent/research-offers';
import { api } from '../../_generated/api';

export const processOfferResearchBatchArgs = {
  batchSize: v.optional(v.number()),
};

export const processOfferResearchBatchHandler = async (ctx: MutationCtx, args: { batchSize?: number }) => {
  const batchSize = args.batchSize || 30;
  const startTime = Date.now();

  try {
    // Get casinos for research
    const casinos = await ctx.db
      .query('casinos')
      .withIndex('tracked_by_offer_check', (q) => q.eq('is_tracked', true))
      .order('asc') // null values first, then oldest timestamps
      .take(batchSize);

    if (casinos.length === 0) {
      return {
        success: true,
        message: 'No tracked casinos found for offer research',
        processed: 0,
        duration: Date.now() - startTime,
      };
    }

    // Prepare casino data for AI research
    const casinosForResearch: CasinoForResearch[] = casinos.map((casino) => ({
      id: casino._id,
      name: casino.name,
      website: casino.website,
    }));

    // Research offers using AI
    const researchResult = await researchCasinoOffers(casinosForResearch);

    if (!researchResult.success || !researchResult.data) {
      console.error('❌ AI research failed:', researchResult.error);
      return {
        success: false,
        error: researchResult.error || 'AI research failed',
        processed: 0,
        duration: Date.now() - startTime,
      };
    }

    // Process each casino's offers
    const processingResults = {
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      errors: [] as string[],
    };

    for (const casinoResearch of researchResult.data) {
      try {
        // Find the casino in our database
        const casino = casinos.find((c) => c.name === casinoResearch.casino_name);
        if (!casino) {
          console.warn(`⚠️ Casino not found in database: ${casinoResearch.casino_name}`);
          continue;
        }

        // Create new offers for this casino
        const createResult = await ctx.runMutation(api.offers.index.createOffers, {
          casinoId: casino._id,
          offers: casinoResearch.offers,
          source: 'ai_research',
        });

        processingResults.totalProcessed++;
        processingResults.totalCreated += createResult.created;
        processingResults.totalUpdated += createResult.updated;
        processingResults.totalSkipped += createResult.skipped;
      } catch (error: any) {
        const errorMsg = `Failed to process offers for ${casinoResearch.casino_name}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        processingResults.errors.push(errorMsg);
      }
    }

    // Update last_offer_check timestamp for all processed casinos
    const casinoIds = casinos.map((c) => c._id);
    await ctx.runMutation(api.casinos.index.updateOfferCheckTimestamp, {
      casinoIds,
      timestamp: Date.now(),
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      processed: processingResults.totalProcessed,
      created: processingResults.totalCreated,
      updated: processingResults.totalUpdated,
      skipped: processingResults.totalSkipped,
      errors: processingResults.errors,
      duration,
    };
  } catch (error: any) {
    console.error('❌ Batch processing failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during batch processing',
      processed: 0,
      duration: Date.now() - startTime,
    };
  }
};
