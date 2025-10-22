import { mutation, query } from '../_generated/server';
import { createResearchLogArgs, createResearchLogHandler } from './mutations/createResearchLog';
import { getResearchLogsArgs, getResearchLogsHandler } from './queries/getResearchLogs';

export const createResearchLog = mutation({
  args: createResearchLogArgs,
  handler: createResearchLogHandler,
});

export const getResearchLogs = query({
  args: getResearchLogsArgs,
  handler: getResearchLogsHandler,
});
