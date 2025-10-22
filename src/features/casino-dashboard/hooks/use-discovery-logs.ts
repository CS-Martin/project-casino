'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export const useDiscoveryLogs = (limit: number = 5) => {
  const data = useQuery(api.casino_discovery_logs.index.getDiscoveryLogs, { limit });

  return {
    logs: data?.logs || [],
    stats: data?.stats,
    isLoading: data === undefined,
  };
};
