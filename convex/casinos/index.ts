import { mutation, query } from '../_generated/server';
import { createCasinoArgs, createCasinoHandler } from './mutations/createCasino';
import { createMultipleCasinosArgs, createMultipleCasinosHandler } from './mutations/createMultipleCasinos';
import { deleteCasinoArgs, deleteCasinoHandler } from './mutations/deleteCasino';
import { updateCasinoArgs, updateCasinoHandler } from './mutations/updateCasino';
import { getAllCasinosHandler } from './queries/getAllCasino';
import { getCasinoByIdArgs, getCasinoByIdHandler } from './queries/getCasinoById';
import { getCasinosByStateArgs, getCasinosByStateHandler } from './queries/getCasinosByState';
import { getCasinoStatsHandler } from './queries/getCasinoStats';
import { getCasinosByStateStatsHandler } from './queries/getCasinosByStateStats';
import { getCasinosPaginatedArgs, getCasinosPaginatedHandler } from './queries/getCasinosPaginated';

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
