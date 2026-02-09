import { useEffect, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

const STORAGE_KEY = 'likedNotes';

interface LikedNotesStore {
  [principal: string]: Set<string>;
}

function loadLikedNotes(): LikedNotesStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    const result: LikedNotesStore = {};
    
    for (const [principal, noteIds] of Object.entries(parsed)) {
      result[principal] = new Set(noteIds as string[]);
    }
    
    return result;
  } catch {
    return {};
  }
}

function saveLikedNotes(store: LikedNotesStore): void {
  try {
    const serializable: { [key: string]: string[] } = {};
    for (const [principal, noteIds] of Object.entries(store)) {
      serializable[principal] = Array.from(noteIds);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save liked notes:', error);
  }
}

export function useLikedNotes() {
  const { identity } = useInternetIdentity();
  const [likedNotes, setLikedNotes] = useState<LikedNotesStore>(loadLikedNotes);

  const principal = identity?.getPrincipal().toString();

  const hasLiked = (noteId: bigint): boolean => {
    if (!principal) return false;
    const userLikes = likedNotes[principal];
    return userLikes ? userLikes.has(noteId.toString()) : false;
  };

  const markAsLiked = (noteId: bigint): void => {
    if (!principal) return;
    
    setLikedNotes(prev => {
      const updated = { ...prev };
      if (!updated[principal]) {
        updated[principal] = new Set();
      }
      updated[principal].add(noteId.toString());
      saveLikedNotes(updated);
      return updated;
    });
  };

  return {
    hasLiked,
    markAsLiked,
  };
}
