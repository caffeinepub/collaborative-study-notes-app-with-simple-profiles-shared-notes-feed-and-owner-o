# Specification

## Summary
**Goal:** Let anyone view the full list of users who liked a specific note.

**Planned changes:**
- Add a public backend query that takes a noteId and returns the list of likers for that note, with clear handling for “note not found” and empty-like cases.
- Introduce a dedicated public backend type for displaying likers (principal + name + college), derived from existing noteLikes and profiles data with safe fallbacks for missing profiles.
- Add React Query cache keys and a hook to fetch a note’s likers list by noteId, handling missing noteId/actor-not-ready states consistently.
- Update the note reader UI to include a “Liked by” view that lists all likers (name + college) with loading, empty, and error/retry states, visible to everyone (including unauthenticated users who can view notes).
- Keep existing like button behavior unchanged (one-like-per-user and likeCount display) while ensuring the likers list updates after a successful like (via refetch/invalidation or predictable update).

**User-visible outcome:** From a note’s reader view, anyone can open a “Liked by” list to see who liked the note (including each liker’s name and college), with appropriate loading/empty/error handling and no changes to the existing like button behavior.
