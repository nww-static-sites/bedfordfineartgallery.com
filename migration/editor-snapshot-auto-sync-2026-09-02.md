# Content Editor Snapshot Synchronization

Module 424 (Content Editor) now compares its local saved-content snapshot with
the authoritative source whenever publication status is checked. If a newer
source-only change exists, the module verifies and atomically installs the new
snapshot before the first page render.

An already-open editor also reconciles automatically. An active draft is never
replaced: synchronization waits until the user finishes or cancels that edit,
then reloads the latest saved content without requiring the separate Reload
Latest Content action.

The manual reload control remains available as a recovery action. Snapshot
installation remains checksum-verified, size-bounded, locked, and fail-closed;
a synchronization problem does not conceal publication status or discard local
draft text.
