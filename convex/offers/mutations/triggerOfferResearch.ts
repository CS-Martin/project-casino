import { researchCasinoOffers } from '../../../src/features/promotional-research/ai-agent/research-offers';
import { api } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import { action, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';

const DEFAULT_BATCH_SIZE = 30;

export const triggerOfferResearchArgs = {
  casinoIds: v.optional(v.array(v.id('casinos'))),
  batchSize: v.optional(v.number()),
};

export const triggerOfferResearchHandler = async (
  ctx: ActionCtx,
  args: { casinoIds?: Id<'casinos'>[]; batchSize?: number }
) => {
  const batchSize = args.batchSize || DEFAULT_BATCH_SIZE;
  const startTime = Date.now();
  const triggeredBy = args.casinoIds ? 'manual' : 'cron';

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
      const duration = Date.now() - startTime;

      // Save log for empty run
      try {
        await ctx.runMutation(api.offer_research_logs.index.createResearchLog, {
          casinos_researched: 0,
          offers_created: 0,
          offers_updated: 0,
          offers_skipped: 0,
          casinos: [],
          duration_ms: duration,
          success: true,
          triggered_by: triggeredBy,
          batch_size: batchSize,
        });
      } catch (logError) {
        console.error('Failed to save research log:', logError);
      }

      return {
        success: true,
        message: 'No casinos found for offer research',
        processed: 0,
        duration,
      };
    }

    // Import the research service dynamically to avoid circular dependencies

    // Prepare casino data for AI research
    const casinosForResearch = casinos.map((casino) => ({
      id: casino?._id as Id<'casinos'>,
      name: casino?.name as string,
      website: casino?.website as string,
    }));

    // Research offers using AI
    const researchResult = await researchCasinoOffers(casinosForResearch);

    if (researchResult.usage) {
      try {
        await ctx.runMutation(api.ai_usage.index.logAIUsage, {
          model: 'gpt-4o-mini',
          operation: 'offer-research',
          input_tokens: researchResult.usage.inputTokens,
          output_tokens: researchResult.usage.outputTokens,
          total_tokens: researchResult.usage.totalTokens,
          estimated_cost: researchResult.usage.estimatedCost,
          duration_ms: Date.now() - startTime,
          success: researchResult.success,
          error_message: researchResult.error,
          context: {
            batchSize: casinos.length,
            offersCount: researchResult.data?.length || 0,
          },
        });
      } catch (logError) {
        console.error('Failed to log AI usage:', logError);
      }
    }

    if (!researchResult.success || !researchResult.data) {
      const duration = Date.now() - startTime;

      // Save failed research log
      try {
        await ctx.runMutation(api.offer_research_logs.index.createResearchLog, {
          casinos_researched: 0,
          offers_created: 0,
          offers_updated: 0,
          offers_skipped: 0,
          casinos: casinos.map((c) => ({
            id: c?._id as Id<'casinos'>,
            name: c?.name as string,
          })),
          duration_ms: duration,
          success: false,
          errors: [researchResult.error || 'AI research failed'],
          triggered_by: triggeredBy,
          batch_size: batchSize,
        });
      } catch (logError) {
        console.error('Failed to save error log:', logError);
      }

      return {
        success: false,
        error: researchResult.error || 'AI research failed',
        processed: 0,
        duration,
      };
    }

    // Process each casino's offers
    const processingResults = {
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      errors: [] as string[],
      processedCasinos: [] as Array<{ id: Id<'casinos'>; name: string; state?: string }>,
      offerDetails: [] as Array<{
        casino_name: string;
        offer_name: string;
        action: string;
        reason?: string;
        offer_type?: string;
        expected_bonus?: number;
      }>,
    };

    for (const casinoResearch of researchResult.data) {
      try {
        // Find the casino in our database by ID
        const casino = casinos.find((c) => c?._id === casinoResearch.casino_id);
        if (!casino) {
          processingResults.errors.push(
            `Casino ID mismatch: ${casinoResearch.casino_name} (ID: ${casinoResearch.casino_id})`
          );
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

        // Get state abbreviation
        let stateAbb: string | undefined;
        if (casino.state_id) {
          const state = await ctx.runQuery(api.states.index.getStateById, { stateId: casino.state_id });
          stateAbb = state?.abbreviation;
        }

        processingResults.processedCasinos.push({
          id: casino._id as Id<'casinos'>,
          name: casino.name as string,
          state: stateAbb,
        });

        // Add offer details to log
        if (createResult.details) {
          processingResults.offerDetails.push(
            ...createResult.details.map((detail) => ({
              casino_name: casino.name as string,
              ...detail,
            }))
          );
        }
      } catch (error: any) {
        const errorMsg = `Failed to process offers for ${casinoResearch.casino_name}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        processingResults.errors.push(errorMsg);
      }
    }

    // Update last_offer_check timestamp for successfully processed casinos only
    const processedCasinoIds = processingResults.processedCasinos.map((c) => c.id);
    if (processedCasinoIds.length > 0) {
      await ctx.runMutation(api.casinos.index.updateOfferCheckTimestamp, {
        casinoIds: processedCasinoIds,
        timestamp: Date.now(),
      });
    }

    const duration = Date.now() - startTime;

    const result = {
      success: true,
      processed: processingResults.totalProcessed,
      created: processingResults.totalCreated,
      updated: processingResults.totalUpdated,
      skipped: processingResults.totalSkipped,
      errors: processingResults.errors,
      duration,
      triggeredBy,
    };

    // Save research log to history
    try {
      await ctx.runMutation(api.offer_research_logs.index.createResearchLog, {
        casinos_researched: processingResults.totalProcessed,
        offers_created: processingResults.totalCreated,
        offers_updated: processingResults.totalUpdated,
        offers_skipped: processingResults.totalSkipped,
        casinos: processingResults.processedCasinos, // Only log successfully processed casinos
        offer_details: processingResults.offerDetails.length > 0 ? processingResults.offerDetails : undefined,
        duration_ms: duration,
        success: true,
        errors: processingResults.errors.length > 0 ? processingResults.errors : undefined,
        triggered_by: triggeredBy,
        batch_size: batchSize,
      });
    } catch (logError) {
      console.error('Failed to save research log:', logError);
      // Don't fail the whole request if logging fails
    }

    return result;
  } catch (error: any) {
    console.error('❌ Offer research trigger failed:', error);
    const duration = Date.now() - startTime;

    // Save failed research log
    try {
      await ctx.runMutation(api.offer_research_logs.index.createResearchLog, {
        casinos_researched: 0,
        offers_created: 0,
        offers_updated: 0,
        offers_skipped: 0,
        casinos: [], // No casinos processed in case of error
        duration_ms: duration,
        success: false,
        errors: [error.message || 'Unknown error occurred'],
        triggered_by: triggeredBy,
        batch_size: batchSize,
      });
    } catch (logError) {
      console.error('Failed to save error log:', logError);
    }

    return {
      success: false,
      error: error.message || 'Unknown error occurred during manual trigger',
      processed: 0,
      duration,
      triggeredBy,
    };
  }
};

export const triggerOfferResearch = action({
  args: triggerOfferResearchArgs,
  handler: triggerOfferResearchHandler,
});
