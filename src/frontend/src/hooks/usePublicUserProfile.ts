import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CACHE_KEYS } from '../lib/cacheKeys';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

/**
 * Fetch a public user profile by principal
 * This is used to display avatars for note authors and commenters
 */
export function usePublicUserProfile(principal: Principal | string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  
  const principalString = principal 
    ? (typeof principal === 'string' ? principal : principal.toString())
    : null;

  return useQuery<UserProfile | null>({
    queryKey: principalString ? CACHE_KEYS.userProfile(principalString) : ['userProfile', 'null'],
    queryFn: async () => {
      if (!actor || !principalString) return null;
      const principalObj = typeof principal === 'string' ? Principal.fromText(principal) : principal;
      if (!principalObj) return null;
      return actor.getUserProfile(principalObj);
    },
    enabled: !!actor && !actorFetching && !!principalString,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
