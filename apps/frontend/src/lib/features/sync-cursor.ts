const PULL_CURSOR_KEY = 'myfit-sync-cursor';

/** Loads the changelog id the last pull reached, so a reload resumes instead of pulling from the start. */
export const loadPullCursor = () => localStorage.getItem(PULL_CURSOR_KEY);

/** Remembers the changelog id the latest pull reached. */
export const savePullCursor = (changelogId: string) =>
	localStorage.setItem(PULL_CURSOR_KEY, changelogId);

/** Forgets the saved cursor. Call it when the local database is deleted, so the next account pulls from the start. */
export const clearPullCursor = () => localStorage.removeItem(PULL_CURSOR_KEY);
