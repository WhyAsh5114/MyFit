/**
 * `next`, with each item that is unchanged since `previous` swapped back for the previous object.
 *
 * The chat replaces a streaming message with a fresh copy on every chunk, so every part is a new
 * object each time. A part's component that gets the same object doesn't re-render, so only the
 * part that changed does, instead of every card in a reply with many tool calls.
 */
export function reuseUnchanged<T>(previous: readonly T[], next: readonly T[]): T[] {
	return next.map((item, index) => {
		const old = previous[index];
		return old !== undefined && JSON.stringify(old) === JSON.stringify(item) ? old : item;
	});
}
