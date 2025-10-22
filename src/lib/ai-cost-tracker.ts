/**
 * AI Cost Tracking Utility
 *
 * Tracks token usage and costs for OpenAI API calls.
 * Logs usage to Convex database for persistent analytics.
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { logger } from './logger';

// Current OpenAI pricing (as of January 2024)
// Update from: https://openai.com/api/pricing/
const MODEL_PRICING = {
  'gpt-4o-mini': {
    input: 0.00015 / 1000, // $0.00015 per 1K input tokens
    output: 0.0006 / 1000, // $0.0006 per 1K output tokens
  },
  'gpt-4o': {
    input: 0.0025 / 1000, // $0.0025 per 1K input tokens
    output: 0.01 / 1000, // $0.01 per 1K output tokens
  },
  'gpt-4-turbo': {
    input: 0.01 / 1000,
    output: 0.03 / 1000,
  },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

export interface AIUsageParams {
  model: ModelName;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  durationMs?: number;
  success?: boolean;
  error?: string;
  context?: {
    casinoId?: string;
    casinoName?: string;
    statesCount?: number;
    offersCount?: number;
    batchSize?: number;
  };
}

export interface AIUsageResult {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: ModelName;
  operation: string;
}

class AIUsageTracker {
  private convex: ConvexHttpClient | null = null;
  private isConvexBackend: boolean;

  constructor() {
    // Detect if we're running in Convex backend (no NEXT_PUBLIC_CONVEX_URL available)
    this.isConvexBackend = typeof process !== 'undefined' && !process.env.NEXT_PUBLIC_CONVEX_URL;

    // Only create client if we're not in Convex backend
    if (!this.isConvexBackend && process.env.NEXT_PUBLIC_CONVEX_URL) {
      this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    }
  }

  /**
   * Track AI usage and log to Convex database
   */
  async track(params: AIUsageParams): Promise<AIUsageResult> {
    const pricing = MODEL_PRICING[params.model];

    const totalTokens = params.inputTokens + params.outputTokens;
    const estimatedCost = params.inputTokens * pricing.input + params.outputTokens * pricing.output;

    const result: AIUsageResult = {
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens,
      estimatedCost,
      model: params.model,
      operation: params.operation,
    };

    // Log to Convex database (skip if running in Convex backend)
    if (this.convex && !this.isConvexBackend) {
      try {
        await this.convex.mutation(api.ai_usage.index.logAIUsage, {
          model: params.model,
          operation: params.operation,
          input_tokens: params.inputTokens,
          output_tokens: params.outputTokens,
          total_tokens: totalTokens,
          estimated_cost: estimatedCost,
          duration_ms: params.durationMs,
          success: params.success ?? true,
          error_message: params.error,
          context: params.context,
        });

        // Log only in development to avoid spam
        logger.debug('AI usage tracked', {
          ...result,
          cost: `$${estimatedCost.toFixed(6)}`,
          duration: params.durationMs,
        });
      } catch (error) {
        // Don't fail the request if logging fails
        logger.error('Failed to log AI usage to database', error, {
          model: params.model,
          operation: params.operation,
        });
      }
    }

    return result;
  }

  /**
   * Helper to extract usage from OpenAI response and track it
   */
  async trackFromResponse(
    response: { usage?: { input_tokens?: number; output_tokens?: number } },
    params: {
      model: ModelName;
      operation: string;
      durationMs?: number;
      success?: boolean;
      context?: AIUsageParams['context'];
    }
  ): Promise<AIUsageResult | null> {
    if (!response.usage) {
      logger.warn('No usage data in OpenAI response', {
        model: params.model,
        operation: params.operation,
      });
      return null;
    }

    return this.track({
      model: params.model,
      operation: params.operation,
      inputTokens: response.usage.input_tokens || 0,
      outputTokens: response.usage.output_tokens || 0,
      durationMs: params.durationMs,
      success: params.success ?? true,
      context: params.context,
    });
  }
}

// Export singleton instance
export const aiUsageTracker = new AIUsageTracker();

// Export pricing for reference
export { MODEL_PRICING };
