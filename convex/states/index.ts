import { mutation } from '../_generated/server';
import { createStateArgs, createStateHandler } from './mutations/createState';
import { getOrCreateStateArgs, getOrCreateStateHandler } from './mutations/getOrCreateState';

// Mutations
export const createState = mutation({
  args: createStateArgs,
  handler: createStateHandler,
});

export const getOrCreateState = mutation({
  args: getOrCreateStateArgs,
  handler: getOrCreateStateHandler,
});
