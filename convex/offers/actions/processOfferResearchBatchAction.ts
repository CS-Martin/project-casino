import { action, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { api } from '../../_generated/api';

/**
 * Main action for processing offer research batches
 * This function orchestrates the entire AI-powered offer research process
 */
export const processOfferResearchBatchAction = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx: ActionCtx, args: { batchSize?: number }) => {
    const batchSize = args.batchSize || 30;
    const startTime = Date.now();

    try {
      // STEP 1: Get casinos that need offer research
      // This query prioritizes tracked casinos with oldest last_offer_check timestamps
      const casinos = await ctx.runQuery(api.casinos.index.getCasinosForOfferResearch, {
        batchSize,
      });

      // Early exit if no casinos need research
      if (casinos.length === 0) {
        return {
          success: true,
          message: 'No tracked casinos found for offer research',
          processed: 0,
          duration: Date.now() - startTime,
        };
      }

      // STEP 2: Dynamic import of AI research service
      // We import this dynamically to avoid module load issues during Convex analysis
      // The AI service contains the OpenAI client which needs environment variables
      const { researchCasinoOffers } = await import(
        '../../../src/features/promotional-research/ai-agent/research-offers'
      );

      // STEP 3: Prepare casino data for AI research
      // Transform database records into the format expected by the AI service
      const casinosForResearch = casinos.map((casino) => ({
        id: casino._id,
        name: casino.name,
        website: casino.website,
      }));

      // STEP 4: Call AI service to research current offers
      // This makes an external API call to OpenAI with web search capabilities
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
          // Don't fail the whole operation if logging fails
          console.error('Failed to log AI usage:', logError);
        }
      }

      // Handle AI research failures
      if (!researchResult.success || !researchResult.data) {
        console.error('❌ AI research failed:', researchResult.error);
        return {
          success: false,
          error: researchResult.error || 'AI research failed',
          processed: 0,
          duration: Date.now() - startTime,
        };
      }

      // STEP 5: Process AI research results
      // Initialize counters to track what happened to each offer
      const processingResults = {
        totalProcessed: 0, // Number of casinos successfully processed
        totalCreated: 0, // Number of new offers created
        totalUpdated: 0, // Number of existing offers updated
        totalSkipped: 0, // Number of offers that didn't need changes
        errors: [] as string[], // List of errors encountered
      };

      // STEP 6: Process each casino's research results
      for (const casinoResearch of researchResult.data) {
        try {
          // Find the corresponding casino in our database
          // The AI might return casinos with slightly different names
          const casino = casinos.find((c) => c.name === casinoResearch.casino_name);
          if (!casino) {
            console.warn(`⚠️ Casino not found in database: ${casinoResearch.casino_name}`);
            continue; // Skip this casino and continue with the next one
          }

          // STEP 7: Create new offers for this casino
          // This function creates new offers without upserting to preserve historical data
          const createResult = await ctx.runMutation(api.offers.index.createOffers, {
            casinoId: casino._id,
            offers: casinoResearch.offers, // Array of offers found by AI
            source: 'ai_research', // Tag all offers with this source
          });

          // Update counters with results from this casino
          processingResults.totalProcessed++;
          processingResults.totalCreated += createResult.created;
          processingResults.totalUpdated += createResult.updated;
          processingResults.totalSkipped += createResult.skipped;
        } catch (error: any) {
          // Handle individual casino processing errors
          // Don't let one casino's failure stop the entire batch
          const errorMsg = `Failed to process offers for ${casinoResearch.casino_name}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          processingResults.errors.push(errorMsg);
        }
      }

      // STEP 8: Update last_offer_check timestamp for all processed casinos
      // This ensures we don't research the same casinos again too soon
      const casinoIds = casinos.map((c) => c._id);
      await ctx.runMutation(api.casinos.index.updateOfferCheckTimestamp, {
        casinoIds,
        timestamp: Date.now(),
      });

      // STEP 9: Log final results and return success response
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
      // Handle any unexpected errors in the entire process
      console.error('❌ Batch processing failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred during batch processing',
        processed: 0,
        duration: Date.now() - startTime,
      };
    }
  },
});
