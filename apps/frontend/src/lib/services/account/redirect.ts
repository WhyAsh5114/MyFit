/**
 * Where to send a visitor after signing in: the page they were sent away from, or `fallback`.
 * Only a path on this app's own origin counts. A path such as `/\evil.com` starts with a slash but
 * resolves to another site, so the target is resolved and its origin compared.
 */
export function localRedirect(back: string | null, origin: string, fallback = '/dashboard') {
	if (!back?.startsWith('/')) return fallback;
	try {
		const url = new URL(back, origin);
		if (url.origin !== origin) return fallback;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
