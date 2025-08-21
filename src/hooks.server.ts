import { building } from '$app/environment';
import { auth } from '$lib/auth/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const ALLOWED = new Set([
	'https://localhost', // app shell (Capacitor)
	'http://localhost:4173', // your API during dev
	'http://localhost:5173', // if you use this too
	'http://localhost'
]);

function cors(origin: string, request: Request) {
	const acrh =
		request.headers.get('access-control-request-headers') ??
		'Content-Type, Authorization, X-Requested-With';
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Credentials': 'true',
		'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
		'Access-Control-Allow-Headers': acrh,
		Vary: 'Origin, Access-Control-Request-Headers'
	} as Record<string, string>;
}

const corsHandle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const origin = event.request.headers.get('origin') ?? '';
	const isApiLike = pathname.startsWith('/api') || pathname.startsWith('/_app/remote');
	const shouldCORS = isApiLike && ALLOWED.has(origin);

	if (event.request.method === 'OPTIONS' && isApiLike) {
		return new Response(null, {
			status: 204,
			headers: shouldCORS ? cors(origin, event.request) : {}
		});
	}

	const response = await resolve(event);
	if (shouldCORS) {
		const headers = cors(origin, event.request);
		for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
	}

	return response;
};

const authHandler: Handle = ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(corsHandle, authHandler);
