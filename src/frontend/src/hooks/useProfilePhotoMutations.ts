import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { CACHE_KEYS } from '../lib/cacheKeys';
import type { ProfilePhoto, UserProfile } from '../backend';

/**
 * Upload or update the caller's profile photo
 */
export function useUploadProfilePhoto() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: ProfilePhoto) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get current profile
      const currentProfile = await actor.getCallerUserProfile();
      if (!currentProfile) throw new Error('Profile not found');
      
      // Update profile with new photo
      const updatedProfile: UserProfile = {
        ...currentProfile,
        photo,
      };
      
      await actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      // Invalidate current user profile
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.currentUserProfile });
      
      // Invalidate public profile for current user
      if (identity) {
        const principalString = identity.getPrincipal().toString();
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.userProfile(principalString) });
      }
      
      // Invalidate all user profiles to refresh avatars everywhere
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

/**
 * Remove the caller's profile photo
 */
export function useRemoveProfilePhoto() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Get current profile
      const currentProfile = await actor.getCallerUserProfile();
      if (!currentProfile) throw new Error('Profile not found');
      
      // Update profile with photo removed
      const updatedProfile: UserProfile = {
        ...currentProfile,
        photo: undefined,
      };
      
      await actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      // Invalidate current user profile
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.currentUserProfile });
      
      // Invalidate public profile for current user
      if (identity) {
        const principalString = identity.getPrincipal().toString();
        queryClient.invalidateQueries({ queryKey: CACHE_KEYS.userProfile(principalString) });
      }
      
      // Invalidate all user profiles to refresh avatars everywhere
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
