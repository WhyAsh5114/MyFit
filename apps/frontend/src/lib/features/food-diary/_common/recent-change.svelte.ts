import type { Attachment } from 'svelte/attachments';

/**
 * How long a change stays marked. It must outlast the highlight animation, which only starts once
 * the screen has loaded, and a re-render after that must not replay it.
 */
const HOLD_MS = 4000;

/** The record the user just created or changed, so the screen they land on can show it. */
export const recentChange = $state<{ id: string | null }>({ id: null });

let timer: ReturnType<typeof setTimeout> | undefined;

/** Mark a record before navigating to the list that shows it. */
export function markRecentChange(id: string) {
	recentChange.id = id;
	clearTimeout(timer);
	timer = setTimeout(() => (recentChange.id = null), HOLD_MS);
}

/** Scrolls the element into view when it is the record that was just changed. */
export function revealIfRecent(id: string): Attachment<HTMLElement> {
	return (node) => {
		if (recentChange.id === id) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	};
}
