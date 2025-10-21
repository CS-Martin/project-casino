import { api } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import { action, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const triggerOfferResearchArgs = {
  casinoIds: v.optional(v.array(v.id('casinos'))),
  batchSize: v.optional(v.number()),
};

export const triggerOfferResearchHandler = async (
  ctx: ActionCtx,
  args: { casinoIds?: Id<'casinos'>[]; batchSize?: number }
) => {
  const batchSize = args.batchSize || 30;
  const startTime = Date.now();

  try {
    let casinos;

    if (args.casinoIds && args.casinoIds.length > 0) {
      // Research specific casinos
      casinos = await Promise.all(args.casinoIds.map((id) => ctx.runQuery(api.casinos.index.getCasinoById, { id })));
      casinos = casinos.filter(Boolean); // Remove any null results
    } else {
      // Research casinos that need updates (same logic as batch processing)
      casinos = await ctx.runQuery(api.casinos.index.getCasinosForOfferResearch, {
        batchSize,
      });
    }

    if (casinos.length === 0) {
      return {
        success: true,
        message: 'No casinos found for offer research',
        processed: 0,
        duration: Date.now() - startTime,
      };
    }

    // Import the research service dynamically to avoid circular dependencies
    const { researchCasinoOffers } = await import(
      '../../../src/features/promotional-research/ai-agent/research-offers'
    );

    // Prepare casino data for AI research
    const casinosForResearch = casinos.map((casino) => ({
      id: casino?._id as Id<'casinos'>,
      name: casino?.name as string,
      website: casino?.website as string,
    }));

    // Research offers using AI
    const researchResult = await researchCasinoOffers(casinosForResearch);

    if (!researchResult.success || !researchResult.data) {
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
        const casino = casinos.find((c) => c?.name === casinoResearch.casino_name);
        if (!casino) {
          console.warn(`⚠️ Casino not found in database: ${casinoResearch.casino_name}`);
          continue;
        }

        // Create new offers for this casino (preserves historical data)
        const createResult = await ctx.runMutation(api.offers.index.createOffers, {
          casinoId: casino._id as Id<'casinos'>,
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
    const casinoIds = casinos.map((c) => c?._id as Id<'casinos'>);
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
      triggeredBy: 'manual',
    };
  } catch (error: any) {
    console.error('❌ Manual trigger failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during manual trigger',
      processed: 0,
      duration: Date.now() - startTime,
      triggeredBy: 'manual',
    };
  }
};

export const triggerOfferResearch = action({
  args: triggerOfferResearchArgs,
  handler: triggerOfferResearchHandler,
});
