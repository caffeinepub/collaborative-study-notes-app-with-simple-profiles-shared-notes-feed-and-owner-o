# Specification

## Summary
**Goal:** Use the user-uploaded image as a static background behind the authenticated main NotesFeed screen while keeping the feed content readable in light and dark themes.

**Planned changes:**
- Add the uploaded image (`WhatsApp Image 2026-02-09 at 8.24.07 PM.jpeg`) to the frontend as a static asset and apply it as the background of the NotesFeed container.
- Ensure all feed UI elements (search bar, Create Note button, note cards/grid, and feed footer text) render above the background without breaking scrolling or click interactions.
- Apply a theme-aware overlay/tint and/or subtle blur so text and cards remain legible in both light and dark mode.
- Keep all other screens and non-feed UI areas (e.g., header, sidebar drawer, watermark, toasts, login/profile setup) visually unchanged unless they already share the same feed container area.

**User-visible outcome:** After login, the main notes feed displays on top of the provided background image with readable contrast in both light and dark modes, and the feed remains fully usable (scrolling and interactions work as before).
