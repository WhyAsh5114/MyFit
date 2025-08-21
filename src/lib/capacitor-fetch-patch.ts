import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { Capacitor } from '@capacitor/core';

function isRemotePath(u: URL) {
	return u.pathname.startsWith('/_app/remote') || u.pathname.startsWith('/api');
}

if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
	const base = PUBLIC_BETTER_AUTH_URL.replace(/\/+$/, '');
	const originalFetch = window.fetch;

	window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
		const req = input instanceof Request ? input : new Request(input, init);
		const url = new URL(req.url, window.location.origin);

		const isLocalHost =
			url.origin === 'http://localhost' ||
			url.origin === 'https://localhost' ||
			url.host.startsWith('localhost');

		if (isLocalHost && isRemotePath(url)) {
			const target = new URL(url.pathname + url.search + url.hash, base);
			const cloned = req.clone();

			const rewritten = new Request(target.toString(), {
				method: cloned.method,
				headers: cloned.headers,
				body: cloned.method === 'GET' || cloned.method === 'HEAD' ? undefined : cloned.body,
				credentials: cloned.credentials as RequestCredentials,
				cache: cloned.cache as RequestCache,
				redirect: cloned.redirect as RequestRedirect,
				referrer: cloned.referrer,
				referrerPolicy: cloned.referrerPolicy,
				integrity: (cloned as any).integrity,
				keepalive: cloned.keepalive,
				signal: cloned.signal,
				mode: 'cors'
			});

			return originalFetch(rewritten);
		}

		return originalFetch(req);
	};
}
