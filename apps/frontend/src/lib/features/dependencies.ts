import { invalidate } from '$app/navigation';

/** A key tuple from a feature's key factory, such as `foodEntryKeys.byDate(userId, date)`. */
type Key = readonly string[];

/** The `depends` function of a `load` event. */
export type Depends = (...deps: `${string}:${string}`[]) => void;

/** SvelteKit resolves a dependency against the page URL unless it starts with a scheme. */
const SCHEME = 'app:';

/**
 * The `depends` id for a key. Segments are encoded because ids can hold `:` or `/`, which would
 * blur where one segment ends and the next begins.
 */
export const dependencyId = (key: Key) =>
	`${SCHEME}${key.map((s) => encodeURIComponent(s)).join('/')}` as const;

/** Registers the keys a `load` read, so invalidating any of their prefixes reruns it. */
export function dependOn(depends: Depends, ...keys: Key[]) {
	depends(...keys.map(dependencyId));
}

/**
 * Whether a registered dependency lies under one of the prefixes, the way `invalidateQueries`
 * matches by key prefix: `['foodEntry', 'u1']` covers every day of that user and leaves `u12` alone.
 */
export function isUnder(dependency: string, ...prefixes: Key[]) {
	return prefixes.some((prefix) => {
		const id = dependencyId(prefix);
		return dependency === id || dependency.startsWith(`${id}/`);
	});
}

/**
 * Reruns the active `load`s that depend on a key under one of these prefixes. Resolves once the
 * page has the new data. The page keeps its state and its shallow-routing `page.state`.
 */
export function invalidateKeys(...prefixes: Key[]) {
	return invalidate(({ href }) => isUnder(href, ...prefixes), true);
}
