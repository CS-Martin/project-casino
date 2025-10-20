import { mutation, query } from '../_generated/server';
import { createStateArgs, createStateHandler } from './mutations/createState';
import { getOrCreateStateArgs, getOrCreateStateHandler } from './mutations/getOrCreateState';
import { getStateByIdArgs, getStateByIdHandler } from './queries/getStateById';

// Mutations
export const createState = mutation({
  args: createStateArgs,
  handler: createStateHandler,
});

export const getOrCreateState = mutation({
  args: getOrCreateStateArgs,
  handler: getOrCreateStateHandler,
});

// Queries
export const getStateById = query({
  args: getStateByIdArgs,
  handler: getStateByIdHandler,
});
