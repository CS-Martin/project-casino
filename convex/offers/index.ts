import { action, internalAction, mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { createOffersArgs, createOffersHandler } from './mutations/createOffers';
import { processOfferResearchBatchArgs, processOfferResearchBatchHandler } from './mutations/processOfferResearchBatch';
import { triggerOfferResearchArgs, triggerOfferResearchHandler } from './mutations/triggerOfferResearch';
import { getOfferResearchStatusArgs, getOfferResearchStatusHandler } from './queries/getOfferResearchStatus';
import { getOfferResearchLogsArgs, getOfferResearchLogsHandler } from './queries/getOfferResearchLogs';
import { getOfferKpisArgs, getOfferKpisHandler } from './queries/getOfferKpis';
import { getOfferTimelineArgs, getOfferTimelineHandler } from './queries/getOfferTimeline';
import { getOfferTypeBreakdownArgs, getOfferTypeBreakdownHandler } from './queries/getOfferTypeBreakdown';

// Mutations
export const createOffers = mutation({
  args: createOffersArgs,
  handler: createOffersHandler,
});

export const processOfferResearchBatch = mutation({
  args: processOfferResearchBatchArgs,
  handler: processOfferResearchBatchHandler,
});

export const triggerOfferResearch = action({
  args: triggerOfferResearchArgs,
  handler: triggerOfferResearchHandler,
});

// Queries
export const getOfferResearchStatus = query({
  args: getOfferResearchStatusArgs,
  handler: getOfferResearchStatusHandler,
});

export const getOfferResearchLogs = query({
  args: getOfferResearchLogsArgs,
  handler: getOfferResearchLogsHandler,
});

export const getOfferKpis = query({
  args: getOfferKpisArgs,
  handler: getOfferKpisHandler,
});

export const getOfferTimeline = query({
  args: getOfferTimelineArgs,
  handler: getOfferTimelineHandler,
});

export const getOfferTypeBreakdown = query({
  args: getOfferTypeBreakdownArgs,
  handler: getOfferTypeBreakdownHandler,
});
