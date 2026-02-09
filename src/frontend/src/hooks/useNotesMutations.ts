import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CACHE_KEYS } from '../lib/cacheKeys';

interface CreateNoteInput {
  author: string;
  year: string;
  college: string;
  questionNo: string;
  questionText: string;
  answer: string;
  isStarred: boolean;
  isPinned: boolean;
}

interface UpdateNoteInput extends CreateNoteInput {
  noteId: bigint;
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createNote(
        input.author,
        input.year,
        input.college,
        input.questionNo,
        input.questionText,
        input.answer,
        input.isStarred,
        input.isPinned
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateNote(
        input.noteId,
        input.author,
        input.year,
        input.college,
        input.questionNo,
        input.questionText,
        input.answer,
        input.isStarred,
        input.isPinned
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(variables.noteId) });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
    },
  });
}

export function useToggleStarPin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, isStarred, isPinned }: { noteId: bigint; isStarred: boolean; isPinned: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.toggleStarPin(noteId, isStarred, isPinned);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(variables.noteId) });
    },
  });
}

export function useLikeNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likeNote(noteId);
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(noteId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.noteLikers(noteId) });
    },
  });
}
