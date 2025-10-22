import { mutation, query, internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { createCasinoArgs, createCasinoHandler } from './mutations/createCasino';
import { createMultipleCasinosArgs, createMultipleCasinosHandler } from './mutations/createMultipleCasinos';
import { deleteCasinoArgs, deleteCasinoHandler } from './mutations/deleteCasino';
import { toggleTrackCasinoArgs, toggleTrackCasinoHandler } from './mutations/toggleTrackCasino';
import { updateCasinoArgs, updateCasinoHandler } from './mutations/updateCasino';
import { getAllCasinosHandler } from './queries/getAllCasino';
import { getCasinoByIdArgs, getCasinoByIdHandler } from './queries/getCasinoById';
import { getCasinosByStateArgs, getCasinosByStateHandler } from './queries/getCasinosByState';
import { getCasinoStatsHandler } from './queries/getCasinoStats';
import { getCasinosByStateStatsHandler } from './queries/getCasinosByStateStats';
import { getCasinosPaginatedArgs, getCasinosPaginatedHandler } from './queries/getCasinosPaginated';
import { getCasinosSearchableArgs, getCasinosSearchableHandler } from './queries/getCasinosSearchable';
import {
  getCasinosForOfferResearchArgs,
  getCasinosForOfferResearchHandler,
} from './queries/getCasinosForOfferResearch';
import { getCasinosWithOfferStatsArgs, getCasinosWithOfferStatsHandler } from './queries/getCasinosWithOfferStats';
import { getCasinoDetailWithOffersArgs, getCasinoDetailWithOffersHandler } from './queries/getCasinoDetailWithOffers';
import { updateOfferCheckTimestampArgs, updateOfferCheckTimestampHandler } from './mutations/updateOfferCheckTimestamp';
import { scheduledCasinoDiscoveryArgs, scheduledCasinoDiscoveryHandler } from './actions/scheduledCasinoDiscovery';

// Queries
export const getAllCasinos = query({
  handler: getAllCasinosHandler,
});

export const getCasinoById = query({
  args: getCasinoByIdArgs,
  handler: getCasinoByIdHandler,
});

export const getCasinosByState = query({
  args: getCasinosByStateArgs,
  handler: getCasinosByStateHandler,
});

export const getCasinoStats = query({
  handler: getCasinoStatsHandler,
});

export const getCasinosByStateStats = query({
  handler: getCasinosByStateStatsHandler,
});

export const getCasinosPaginated = query({
  args: getCasinosPaginatedArgs,
  handler: getCasinosPaginatedHandler,
});

export const getCasinosSearchable = query({
  args: getCasinosSearchableArgs,
  handler: getCasinosSearchableHandler,
});

export const getCasinosForOfferResearch = query({
  args: getCasinosForOfferResearchArgs,
  handler: getCasinosForOfferResearchHandler,
});

export const getCasinosWithOfferStats = query({
  args: getCasinosWithOfferStatsArgs,
  handler: getCasinosWithOfferStatsHandler,
});

export const getCasinoDetailWithOffers = query({
  args: getCasinoDetailWithOffersArgs,
  handler: getCasinoDetailWithOffersHandler,
});

// Mutations
export const createCasino = mutation({
  args: createCasinoArgs,
  handler: createCasinoHandler,
});

export const createMultipleCasinos = mutation({
  args: createMultipleCasinosArgs,
  handler: createMultipleCasinosHandler,
});

export const deleteCasino = mutation({
  args: deleteCasinoArgs,
  handler: deleteCasinoHandler,
});

export const updateCasino = mutation({
  args: updateCasinoArgs,
  handler: updateCasinoHandler,
});

export const toggleTrackCasino = mutation({
  args: toggleTrackCasinoArgs,
  handler: toggleTrackCasinoHandler,
});

export const updateOfferCheckTimestamp = mutation({
  args: updateOfferCheckTimestampArgs,
  handler: updateOfferCheckTimestampHandler,
});

// Actions
export const scheduledCasinoDiscovery = internalAction({
  args: scheduledCasinoDiscoveryArgs,
  handler: scheduledCasinoDiscoveryHandler,
});
