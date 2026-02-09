import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '../lib/cacheKeys';

export function useResumeRefresh(selectedNoteId: bigint | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
        if (selectedNoteId !== null) {
          queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(selectedNoteId) });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App regained focus
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
        if (selectedNoteId !== null) {
          queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(selectedNoteId) });
        }
      }
    };

    const handleFocus = () => {
      // Window regained focus
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.notes });
      if (selectedNoteId !== null) {
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.note(selectedNoteId) });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient, selectedNoteId]);
}
