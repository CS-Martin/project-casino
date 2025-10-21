import { action, internalAction, mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { upsertOffersArgs, upsertOffersHandler } from './mutations/upsertOffers';
import { createOffersArgs, createOffersHandler } from './mutations/createOffers';
import { processOfferResearchBatchArgs, processOfferResearchBatchHandler } from './mutations/processOfferResearchBatch';
import { triggerOfferResearchArgs, triggerOfferResearchHandler } from './mutations/triggerOfferResearch';
import { getOfferResearchStatusArgs, getOfferResearchStatusHandler } from './queries/getOfferResearchStatus';
import { getOfferResearchLogsArgs, getOfferResearchLogsHandler } from './queries/getOfferResearchLogs';

// Mutations
export const upsertOffers = mutation({
  args: upsertOffersArgs,
  handler: upsertOffersHandler,
});

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
