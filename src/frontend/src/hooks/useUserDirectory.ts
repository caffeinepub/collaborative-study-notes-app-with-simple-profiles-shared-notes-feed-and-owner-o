import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CACHE_KEYS } from '../lib/cacheKeys';
import type { ExtendedUserProfile } from '../backend';

export function useUserDirectory() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<ExtendedUserProfile[]>({
    queryKey: CACHE_KEYS.userDirectory,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
