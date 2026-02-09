import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CACHE_KEYS } from '../lib/cacheKeys';
import type { Note } from '../backend';

export function useListNotes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: CACHE_KEYS.notes,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotesSortedByQuestionNo();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Poll every 5 seconds for near-real-time updates
    staleTime: 3000,
  });
}

export function useGetNote(noteId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Note | null>({
    queryKey: noteId !== null ? CACHE_KEYS.note(noteId) : ['note', 'null'],
    queryFn: async () => {
      if (!actor || noteId === null) return null;
      return actor.getNote(noteId);
    },
    enabled: !!actor && !actorFetching && noteId !== null,
    retry: 1,
  });
}
