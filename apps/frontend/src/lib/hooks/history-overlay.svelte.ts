import { goto } from '$app/navigation';
import { page } from '$app/state';

/**
 * Whether a drawer, sheet or panel the user opened is open, kept as one step in the browser
 * history with SvelteKit's shallow routing. Opening it adds a history entry on the same URL, so
 * Back (the system gesture, the Android button, the browser) closes it and stays on the page.
 * Closing it with its own close control goes back one history entry, undoing the one opening
 * added, so history is as it was and the next Back leaves the page as usual.
 * The entry survives a reload, so a reloaded page reopens the overlay and Back still closes it.
 *
 * Bind it to the overlay: `bind:open={() => panel.open, (open) => (panel.open = open)}`.
 * Navigating away closes it, since a new page starts with no state. By default the entry stays,
 * so Back from the new page returns to this page with the overlay open again, which suits an
 * overlay the user browses and comes back to. A link from a menu or a one-way action replaces
 * the entry instead (`data-sveltekit-replacestate`, or `replace: true` for `goto`), so Back
 * returns with the overlay closed.
 */
export class HistoryOverlay {
	readonly #id: string;
	/**
	 * The history state a request was made from. `page.state` changes only once SvelteKit has
	 * applied the request, so a second request from the same state is the same request again:
	 * a double tap, or the close control and the overlay's own change event in one tick.
	 */
	#requestedFrom: App.PageState | undefined;

	/** `id` names the overlay in the history state, so two overlays never read as each other. */
	constructor(id: string) {
		this.#id = id;
	}

	get open() {
		return page.state.overlay === this.#id;
	}

	set open(value: boolean) {
		if (value === this.open || this.#requestedFrom === page.state) return;
		this.#requestedFrom = page.state;
		if (value) {
			// The page's own URL, already resolved: only the history state changes.
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			void goto(page.url.href, {
				state: { overlay: this.#id },
				shallow: true,
				persistState: true
			});
		} else {
			history.back();
		}
	}
}
