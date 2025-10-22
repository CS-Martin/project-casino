import { mutation, query } from '../_generated/server';
import { createDiscoveryLogArgs, createDiscoveryLogHandler } from './mutations/createDiscoveryLog';
import { getDiscoveryLogsArgs, getDiscoveryLogsHandler } from './queries/getDiscoveryLogs';

// Mutations
export const createDiscoveryLog = mutation({
  args: createDiscoveryLogArgs,
  handler: createDiscoveryLogHandler,
});

// Queries
export const getDiscoveryLogs = query({
  args: getDiscoveryLogsArgs,
  handler: getDiscoveryLogsHandler,
});
