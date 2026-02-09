export const CACHE_KEYS = {
  notes: ['notes'] as const,
  note: (id: bigint) => ['note', id.toString()] as const,
  noteLikers: (id: bigint) => ['noteLikers', id.toString()] as const,
  currentUserProfile: ['currentUserProfile'] as const,
  userProfile: (principal: string) => ['userProfile', principal] as const,
} as const;
