import { browser } from '$app/environment';
import { initializeClient } from '$lib/idb-client';

export const prerender = true;

export async function load() {
	if (browser) await initializeClient();
}
