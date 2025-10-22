import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export function useResearchLogs(limit?: number) {
  const data = useQuery(api.offer_research_logs.index.getResearchLogs, {
    limit: limit || 5,
  });

  return {
    logs: data?.logs || [],
    stats: data?.stats || null,
    isLoading: data === undefined,
  };
}
