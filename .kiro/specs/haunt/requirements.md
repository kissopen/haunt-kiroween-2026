# Haunt: requirements

Created 2026-11-01 for Kiroween 2026 Costume Contest.

Haunt helps solo makers turn daunting tasks into small, visible wins. Tasks inhabit four rooms: Study, Workshop, Greenhouse, Attic. Finishing tasks restores the room's light. This is a useful task app with a coherent haunted-house metaphor, not a random Halloween skin.

1. A user can add, edit, delete, complete and reopen tasks, with a room, priority, optional due date and a next-action checklist.
2. Task text is always displayed as text, never executable HTML.
3. A room shows its outstanding tasks; its illumination reflects completion. Empty rooms are neutral rather than falsely completed.
4. A focus session can start, pause, resume and end. Elapsed time uses wall-clock timestamps. Only finished sessions add focus minutes; completing a timer never completes a task automatically.
5. State persists in localStorage. Invalid data is recovered safely. Export/import JSON supports backups and validates types and bounds. Import is a replace operation and requires an explicit UI confirmation.
6. Keyboard users can operate all controls. Dialogs support Escape and focus restoration. Reduced-motion settings are honored. Screen readers receive completion/status announcements.
7. English is the initial judge-friendly presentation, with a Chinese interface toggle. No login, keys, paid APIs or network requests are required to use the app.
8. Include a labelled sample board with a clear-data confirmation. Real user data must never be overwritten just by opening the app.

Success: add a task, break it down, focus, complete it, see room light change, reload and retain progress, export and restore the same state.
