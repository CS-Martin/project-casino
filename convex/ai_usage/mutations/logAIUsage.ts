import { v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';

export const logAIUsageArgs = {
  model: v.string(),
  operation: v.string(),
  input_tokens: v.number(),
  output_tokens: v.number(),
  total_tokens: v.number(),
  estimated_cost: v.number(),
  duration_ms: v.optional(v.number()),
  success: v.boolean(),
  error_message: v.optional(v.string()),
  context: v.optional(
    v.object({
      casinoId: v.optional(v.string()),
      casinoName: v.optional(v.string()),
      statesCount: v.optional(v.number()),
      offersCount: v.optional(v.number()),
      batchSize: v.optional(v.number()),
    })
  ),
};

type LogAIUsageArgs = {
  model: string;
  operation: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  duration_ms?: number;
  success: boolean;
  error_message?: string;
  context?: {
    casinoId?: string;
    casinoName?: string;
    statesCount?: number;
    offersCount?: number;
    batchSize?: number;
  };
};

export const logAIUsageHandler = async (ctx: MutationCtx, args: LogAIUsageArgs) => {
  const id = await ctx.db.insert('ai_usage', {
    model: args.model,
    operation: args.operation,
    input_tokens: args.input_tokens,
    output_tokens: args.output_tokens,
    total_tokens: args.total_tokens,
    estimated_cost: args.estimated_cost,
    duration_ms: args.duration_ms,
    success: args.success,
    error_message: args.error_message,
    context: args.context,
  });

  return id;
};
