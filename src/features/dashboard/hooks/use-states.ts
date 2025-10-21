import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';

export const useStates = () => {
  const states = useQuery(api.states.index.getAllStates);

  return {
    states: states || [],
    isLoading: states === undefined,
  };
};
