import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CACHE_KEYS } from '../lib/cacheKeys';
import type { NoteLiker } from '../backend';

export function useGetNoteLikers(noteId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NoteLiker[]>({
    queryKey: noteId !== null ? CACHE_KEYS.noteLikers(noteId) : ['noteLikers', 'null'],
    queryFn: async () => {
      if (!actor || noteId === null) return [];
      return actor.getNoteLikers(noteId);
    },
    enabled: !!actor && !actorFetching && noteId !== null,
  });
}
