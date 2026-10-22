import { browser } from '$app/environment';
import { getDb } from '$lib/clients/idb-client';

export const prerender = true;

export async function load() {
	if (browser) await getDb();
}
