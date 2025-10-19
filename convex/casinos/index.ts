import { mutation, query } from '../_generated/server';
import { createCasinoArgs, createCasinoHandler } from './mutations/createCasino';
import { createMultipleCasinosArgs, createMultipleCasinosHandler } from './mutations/createMultipleCasinos';
import { deleteCasinoArgs, deleteCasinoHandler } from './mutations/deleteCasino';
import { updateCasinoArgs, updateCasinoHandler } from './mutations/updateCasino';
import { getAllCasinoHandler } from './queries/getAllCasino';
import { getCasinoByIdArgs, getCasinoByIdHandler } from './queries/getCasinoById';

// Queries
export const getAllCasino = query({
  handler: getAllCasinoHandler,
});

export const getCasinoById = query({
  args: getCasinoByIdArgs,
  handler: getCasinoByIdHandler,
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
